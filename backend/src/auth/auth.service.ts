/**
 * AuthService
 * -----------
 * Logique métier de l'authentification : vérifie qu'un email est
 * libre, hache le mot de passe, crée ou retrouve l'utilisateur en
 * base (via PrismaService). Séparé du contrôleur pour être
 * réutilisable et testable indépendamment du HTTP.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
}