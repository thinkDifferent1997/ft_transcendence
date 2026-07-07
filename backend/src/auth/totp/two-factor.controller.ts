/**
 * TwoFactorController
 * -------------------
 * HTTP entry points for the 2FA feature. Pure routing: validates input,
 * enforces the right token via guards, and delegates to TwoFactorService.
 * The user is always identified by their JWT (req.user), never by the
 * request body.
 *
 * Routes (mounted under /api/auth/2fa):
 *   POST /setup   -> [full token]    start enrolment, returns QR + secret
 *   POST /enable  -> [full token]    confirm enrolment with a valid code
 *   POST /login   -> [pending token] clear the 2FA challenge at login,
 *                                    upgrading the cookie to a full token
 */
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { TwoFactorService } from './two-factor.service';
import { TotpCodeDto } from './dto/totp-code.dto';
import { FullAuthGuard } from '../jwt/full-auth.guard';
import { PendingAuthGuard } from '../jwt/pending-auth.guard';
import { JwtTokenService } from '../jwt/jwt-token.service';
import type { AuthenticatedRequestUser } from '../jwt/jwt.strategy';

interface AuthedRequest {
  user: AuthenticatedRequestUser;
}

@Controller('api/auth/2fa')
export class TwoFactorController {
  constructor(
    private readonly twoFactor: TwoFactorService,
    private readonly tokens: JwtTokenService,
  ) {}

  @Post('setup')
  @UseGuards(FullAuthGuard)
  setup(@Req() req: AuthedRequest) {
    return this.twoFactor.setup(req.user.userId, req.user.username);
  }

  @Post('enable')
  @UseGuards(FullAuthGuard)
  async enable(@Req() req: AuthedRequest, @Body() dto: TotpCodeDto) {
    await this.twoFactor.activate(req.user.userId, dto.token);
    return { enabled: true };
  }

  @Post('login')
  @UseGuards(PendingAuthGuard)
  async login(
    @Req() req: AuthedRequest,
    @Body() dto: TotpCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const valid = await this.twoFactor.verifyLogin(req.user.userId, dto.token);
    if (!valid) {
      throw new UnauthorizedException('Invalid 2FA code.');
    }
    const token = this.tokens.signFull({
      id: req.user.userId,
      username: req.user.username,
    });
    this.tokens.setCookie(res, token);
    return { authenticated: true };
  }
}
