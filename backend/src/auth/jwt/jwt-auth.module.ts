/**
 * JwtAuthModule
 * -------------
 * Self-contained JWT layer: configures signing/verification, registers
 * the passport-jwt strategy, and exports the token service so any module
 * (the 2FA feature now, the login/OAuth flow later) can mint tokens.
 * Deliberately decoupled from the rest of auth so it can be wired in
 * without editing the OAuth code that is still in flux.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
      // Per-token expiry is set at signing time (full vs pending).
    }),
  ],
  providers: [JwtStrategy, JwtTokenService],
  exports: [JwtTokenService, JwtModule],
})
export class JwtAuthModule {}
