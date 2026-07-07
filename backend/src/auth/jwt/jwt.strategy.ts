/**
 * JwtStrategy
 * -----------
 * Passport strategy that authenticates a request from its JWT. The token
 * is read first from the httpOnly access-token cookie (the normal path,
 * since the OAuth callback is a browser redirect) and, failing that,
 * from an `Authorization: Bearer` header (handy for API testing).
 * `validate` shapes what gets attached to `req.user`.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  JwtPayload,
  TfaState,
} from './jwt-token.service';

/** Shape attached to `req.user` for authenticated requests. */
export interface AuthenticatedRequestUser {
  userId: string;
  username: string;
  tfa: TfaState;
}

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
    });
  }

  validate(payload: JwtPayload): AuthenticatedRequestUser {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      username: payload.username,
      tfa: payload.tfa,
    };
  }
}
