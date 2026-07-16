import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PUBLIC_URL } from '../config/public-url';

@Catch(UnauthorizedException)
export class OAuthFailureFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    res.redirect(`${PUBLIC_URL}/?error=oauth_cancelled`);
  }
}