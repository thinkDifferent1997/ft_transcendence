/**
 * LoginDto
 * --------
 * Décrit la forme attendue des données de connexion (email, mot de
 * passe). Contrairement à RegisterDto, on ne vérifie pas de règles de
 * force sur le mot de passe ici : on contrôle un identifiant existant,
 * pas la création d'un nouveau — seule sa présence compte.
 */
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password!: string;
}
