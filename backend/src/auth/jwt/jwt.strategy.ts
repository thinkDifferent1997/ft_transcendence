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
import { PrismaService } from '../../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedRequestUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    // A valid signature isn't enough: the user must still exist. After a
    // DB wipe (`make fclean`) an old, unexpired cookie would otherwise be
    // accepted for a user that no longer exists in the database.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      username: user.username,
      tfa: payload.tfa,
    };
  }
}
