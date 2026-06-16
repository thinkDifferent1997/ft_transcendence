import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/health') //base root
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly prisma: PrismaService
             ) {}


  @Get() //dveient la racine /api/health
  async getHealth(){
    try {
      await this.prisma.user.count();
      return { status: 'ok', database: 'connected'};
  } catch (error){
    return { status: 'error', database: 'disconnected'};
    }
  }
}
