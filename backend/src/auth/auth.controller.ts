/**
 * AuthController
 * --------------
 * Porte d'entrée HTTP de l'authentification.
 * Définit les routes (POST /auth/register, POST /auth/login, ...),
 * reçoit les requêtes, délègue à AuthService et renvoie la réponse.
 * Ne contient aucune logique métier : uniquement l'aiguillage.
 */
import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Route TEMPORAIRE : sert seulement à vérifier que le module est
  // branché et joignable. Sera remplacee par /register plus tard.
  @Get('ping')
  ping() {
    return { status: 'auth module up' };
  }
}