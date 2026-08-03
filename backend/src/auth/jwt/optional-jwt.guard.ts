/**
 * OptionalJwtAuthGuard
 * --------------------
 * Like the plain `jwt` strategy, but never rejects the request: absence
 * or invalidity of the token simply leaves `req.user` unset instead of
 * throwing a 401. For routes that need to know "is anyone logged in?"
 * without treating "no" as an error (e.g. the session check on app
 * load) — a real 401 there would show up as a network error in the
 * browser console on every visit to the login page.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return user;
  }
}
