/**
 * AuthModule
 * ----------
 * Regroupe tout ce qui concerne l'authentification : contrôleur,
 * service, et (plus tard) les stratégies de session et le 2FA.
 * Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';
import { FortyTwoStrategy } from './fortytwo.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: '42'}),
		PrismaModule,
	],
  controllers: [AuthController],
  providers: [ 
	  AuthService,
	  HashingService,
	  FortyTwoStrategy,
  ],
})
export class AuthModule {}
