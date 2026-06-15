/**
 * AuthModule
 * ----------
 * Regroupe tout ce qui concerne l'authentification : contrôleur,
 * service, et (plus tard) les stratégies de session et le 2FA.
 * Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}