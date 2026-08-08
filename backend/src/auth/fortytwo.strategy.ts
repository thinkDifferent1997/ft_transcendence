import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PUBLIC_URL } from '../config/public-url';
/* eslint-disable-next-line @typescript-eslint/no-require-imports --
 * @types/passport-42 keeps StrategyOptions module-private and omits `scope`,
 * so a typed import fails to compile here under `declaration: true`. The
 * untyped require keeps the constructor loose, which is what the mixin needs.
 * passport-github2 below has complete types and does use a real import. */
const Strategy = require('passport-42').Strategy;

/** Shape this strategy hands to Passport, surfaced as `req.user`. */
export interface FortyTwoOAuthUser {
  fortyTwoID: string;
  username: string;
  email: string;
  avatarUrl: string;
}

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET || 'dummy_secret',
      callbackURL: `${PUBLIC_URL}/api/auth/42/callback`,
      scope: ['public'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { username, emails, _json } = profile;
    const user = {
      fortyTwoID: profile.id,
      username: username,
      email: emails[0].value,
      avatarUrl: _json.image.link,
    };
    return done(null, user);
  }
}
