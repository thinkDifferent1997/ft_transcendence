/**
 * PrismaModule
 * ------------
 * Rend le PrismaService injectable dans toute l'application.
 * Marqué @Global : aucun autre module n'a besoin de le réimporter
 * pour accéder à la base de données.
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
@Global()
export class PrismaModule {}