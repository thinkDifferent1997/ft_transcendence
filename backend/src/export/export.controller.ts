import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { FullAuthGuard } from '../auth/jwt/full-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/jwt/jwt.strategy';

interface AuthedRequest {
  user: AuthenticatedRequestUser;
}

@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('me')
  @UseGuards(FullAuthGuard)
  async exportMyData(@Req() req: AuthedRequest) {
    return this.exportService.exportUserData(req.user.userId);
  }
}