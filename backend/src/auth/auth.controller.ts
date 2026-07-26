/**
 * AuthController
 * --------------
 * Porte d'entrée HTTP de l'authentification.
 * Définit les routes (POST /auth/register, POST /auth/login, ...),
 * reçoit les requêtes, délègue à AuthService et renvoie la réponse.
 */
import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthFailureFilter } from './oauth-failed.filter';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenService } from './jwt/jwt-token.service';
import { PUBLIC_URL } from '../config/public-url';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokens: JwtTokenService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(dto);
    // Sets a pending-token cookie when the user has 2FA enabled (the
    // client must then complete POST /api/auth/2fa/login), otherwise a
    // full-token cookie.
    const { twoFactorRequired } = this.tokens.issueLoginCookie(res, user);
    return { twoFactorRequired };
  }


  /********************** OAUTH 42 API *******************************/

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async fortTwoAuth() {
  
    //empty because NestJS never goes inside, the Guard is taking control at this stage to redirect to the 42 Intranet
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  @UseFilters(OAuthFailureFilter)
  async fortyTwoAuthCallback(@Req() req, @Res() res: Response) {

    const user = await this.authService.loginOrCreate42User(req.user);

    // Issue the JWT cookie (pending if 2FA is enabled, full otherwise)
    // and route the user to the 2FA challenge when required.
    const { twoFactorRequired } = this.tokens.issueLoginCookie(res, user);

    return res.redirect(
      twoFactorRequired
        ? `${PUBLIC_URL}/2fa`
        : `${PUBLIC_URL}/quiz`,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req){
    return req.user;
  
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
       // On écrase le cookie de session par un cookie vide qui expire immédiatement
       res.cookie('jwt', '', {
           httpOnly: true,
           secure: true,
           sameSite: 'strict',
           expires: new Date(0), // expiraton at 1/1 1970 = instantly expired
       });
       return { message: 'Déconnexion réussie' };
  }

  /********************************** *******************************/



  // OAuth GitHub
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // empty: because the guard performs the redirect to GitHub.
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @UseFilters(OAuthFailureFilter)
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const user = await this.authService.loginOrCreateGithubUser(req.user);
    const { twoFactorRequired } = this.tokens.issueLoginCookie(res, user);
    return res.redirect(twoFactorRequired ? `${PUBLIC_URL}/2fa` : `${PUBLIC_URL}/quiz`);
  }
}