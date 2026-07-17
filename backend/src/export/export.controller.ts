import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('me/csv')
  @UseGuards(FullAuthGuard)
  async exportMyDataCsv(@Req() req: AuthedRequest, @Res() res: Response) {
    const csv = await this.exportService.exportUserDataAsCsv(req.user.userId);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="my-data.csv"',
    });
    res.send(csv);
  }

  @Get('me/pdf')
  @UseGuards(FullAuthGuard)
  async exportMyDataPdf(@Req() req: AuthedRequest, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="my-data.pdf"',
    });
    await this.exportService.exportUserDataAsPdf(req.user.userId, res);
  }
}