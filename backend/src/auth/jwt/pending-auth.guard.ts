/**
 * PendingAuthGuard
 * ----------------
 * Requires a valid JWT whose `tfa` claim is `pending`. This is what the
 * 2FA challenge endpoint sits behind: only a holder of a first-factor
 * token may attempt to complete the second factor. A full token is
 * rejected here (it has nothing left to prove).
 */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PendingAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) {
      return false;
    }
    const req = context.switchToHttp().getRequest();
    if (req.user?.tfa !== 'pending') {
      throw new ForbiddenException('Pending 2FA token required.');
    }
    return true;
  }
}
