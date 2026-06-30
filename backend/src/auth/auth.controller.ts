/**
 * AuthController
 * --------------
 * Porte d'entrée HTTP de l'authentification.
 * Définit les routes (POST /auth/register, POST /auth/login, ...),
 * reçoit les requêtes, délègue à AuthService et renvoie la réponse.
 */
import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: any) {
	  return this.authService.login(dto);
  }


  /********************** OAUTH 42 API *******************************/

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async fortTwoAuth() {
	
	  //empty because NestJS never goes inside, the Guard is taking control at this stage to redirect to the 42 Intranet
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthCallback(@Req() req, @Res() res) {
	  
	  const userWithToken = await this.authService.loginOrCreate42User(req.user);

	  // here attach the JWT in a secure cookie (ex: res.cookie('jwt'))

	  return res.redirect('https://localhost:8443/quiz');
  }
  /********************************** *******************************/

}
