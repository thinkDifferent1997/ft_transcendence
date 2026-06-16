/**
 * AuthController
 * --------------
 * Porte d'entrée HTTP de l'authentification.
 * Définit les routes (POST /auth/register, POST /auth/login, ...),
 * reçoit les requêtes, délègue à AuthService et renvoie la réponse.
 * Ne contient aucune logique métier : uniquement l'aiguillage.
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}