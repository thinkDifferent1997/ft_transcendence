/**
 * HashingService
 * --------------
 * Hache les mots de passe avec argon2 et vérifie leur correspondance
 * à la connexion. Brique de sécurité isolée pour être réutilisable
 * et facile à auditer. Ne stocke jamais de mot de passe en clair.
 */
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashingService {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}