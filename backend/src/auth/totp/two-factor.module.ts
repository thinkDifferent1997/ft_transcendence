/**
 * TwoFactorModule
 * ---------------
 * Wires the 2FA feature together and binds the persistence boundary to
 * its current implementation. To switch to a database-backed store
 * later, replace `InMemoryTwoFactorRepository` with the Prisma
 * implementation here — nothing else changes.
 */
import { Module } from '@nestjs/common';
import { TotpService } from './totp.service';
import { QrCodeService } from './qrcode.service';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';
import { TWO_FACTOR_REPOSITORY } from './two-factor.repository';
import { PrismaTwoFactorRepository } from './prisma-two-factor.repository';
import { JwtAuthModule } from '../jwt/jwt-auth.module';

@Module({
  imports: [JwtAuthModule],
  controllers: [TwoFactorController],
  providers: [
    TotpService,
    QrCodeService,
    TwoFactorService,
    { provide: TWO_FACTOR_REPOSITORY, useClass: PrismaTwoFactorRepository },
  ],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
