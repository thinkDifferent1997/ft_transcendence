/**
 * RegisterDto
 * -----------
 * Décrit la forme attendue des données d'inscription (email,
 * username, mot de passe) et porte les règles de validation.
 * Frontière de sécurité côté backend : aucune donnée n'atteint
 * la logique métier sans être validée ici.
 */
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide.' })
  email!: string;

  @IsString()
  @MinLength(3, { message: 'Le pseudo doit faire au moins 3 caractères.' })
  @MaxLength(20, { message: 'Le pseudo ne doit pas dépasser 20 caractères.' })
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères.' })
  @MaxLength(72, { message: 'Le mot de passe ne doit pas dépasser 72 caractères.' })
  password!: string;
}