/**
 * FullAuthGuard
 * -------------
 * Requires a valid JWT whose `tfa` claim is `authenticated`. A pending
 * (first-factor-only) token is rejected, so routes behind this guard are
 * unreachable until any required 2FA step is cleared.
 */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FullAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) {
      return false;
    }
    const req = context.switchToHttp().getRequest();
    if (req.user?.tfa !== 'authenticated') {
      throw new ForbiddenException('Full authentication required.');
    }
    return true;
  }
}
