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
import { LoginDto } from './dto/login.dto';
import { JwtTokenService } from './jwt/jwt-token.service';
import { OptionalJwtAuthGuard } from './jwt/optional-jwt.guard';
import type { AuthenticatedRequestUser } from './jwt/jwt.strategy';
import { PUBLIC_URL } from '../config/public-url';

@Controller('auth')
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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
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

  // Guard optionnel : ne rejette jamais la requête (pas de 401) même sans
  // session valide — pour la vérification "est-ce que quelqu'un est
  // connecté ?" au chargement de l'app, où un 401 n'est pas une erreur
  // mais une réponse normale, et polluerait quand même la console.
  @Get('me')
  @UseGuards(OptionalJwtAuthGuard)
  getProfile(@Req() req: { user: AuthenticatedRequestUser | null }) {
    if (!req.user) {
      return { authenticated: false, twoFactorPending: false };
    }
    // Un token « pending » a franchi le premier facteur mais pas le
    // second : ce n'est pas encore une session. Le signaler comme
    // authentifié laisserait le front entrer dans l'app sans code —
    // le 2FA serait contournable par un simple rechargement.
    if (req.user.tfa !== 'authenticated') {
      return { authenticated: false, twoFactorPending: true };
    }
    return { authenticated: true, twoFactorPending: false, ...req.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
       this.tokens.clearCookie(res);
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
