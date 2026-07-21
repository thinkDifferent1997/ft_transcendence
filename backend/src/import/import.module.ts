import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}