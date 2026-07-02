/**
 * JwtTokenService
 * ---------------
 * Mints the application's JSON Web Tokens and writes them to the client
 * as an httpOnly cookie. Two kinds of token exist:
 *
 *   - full      : a normally authenticated session.
 *   - pending   : issued after the first factor when the user still has
 *                 2FA to clear; it only grants access to the 2FA
 *                 challenge endpoint, never to protected resources.
 *
 * The token's `tfa` claim is what the FullAuthGuard / PendingAuthGuard
 * check. This service holds no HTTP routing and no 2FA logic.
 *
 * Example — wiring into a login flow (e.g. the 42 OAuth callback) once a
 * persisted user is available:
 *
 *   const { twoFactorRequired } = this.tokens.issueLoginCookie(res, user);
 *   return res.redirect(twoFactorRequired ? '/2fa' : '/quiz');
 */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

export type TfaState = 'pending' | 'authenticated';

export interface JwtPayload {
  /** User id (subject) — a UUID string. */
  sub: string;
  username: string;
  tfa: TfaState;
}

/** Minimal user shape needed to mint a token. */
export interface AuthUser {
  id: string;
  username: string;
}

/** Name of the httpOnly cookie carrying the access token. */
export const ACCESS_TOKEN_COOKIE = 'access_token';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwt: JwtService) {}

  /** Sign a fully-authenticated access token. */
  signFull(user: AuthUser): string {
    return this.sign(user, 'authenticated', process.env.JWT_EXPIRES_IN || '7d');
  }

  /** Sign a short-lived token that only allows completing the 2FA step. */
  signPending(user: AuthUser): string {
    return this.sign(
      user,
      'pending',
      process.env.JWT_2FA_PENDING_EXPIRES_IN || '5m',
    );
  }

  private sign(user: AuthUser, tfa: TfaState, expiresIn: string): string {
    const payload: JwtPayload = { sub: user.id, username: user.username, tfa };
    // `expiresIn` comes from env as a plain string; the jsonwebtoken
    // types model it as a template-literal union, hence the cast.
    return this.jwt.sign(payload, { expiresIn: expiresIn as any });
  }

  /** Write the access-token cookie on the response. */
  setCookie(res: Response, token: string): void {
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  /** Remove the access-token cookie (logout). */
  clearCookie(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  }

  /**
   * Convenience for a login endpoint/callback: sets a pending-token
   * cookie when the user has 2FA enabled (caller should then send them
   * to the 2FA challenge), otherwise a full-token cookie. Returns
   * whether the 2FA step is still required.
   */
  issueLoginCookie(
    res: Response,
    user: AuthUser & { isTwoFactorEnabled: boolean },
  ): { twoFactorRequired: boolean } {
    const token = user.isTwoFactorEnabled
      ? this.signPending(user)
      : this.signFull(user);
    this.setCookie(res, token);
    return { twoFactorRequired: user.isTwoFactorEnabled };
  }
}
