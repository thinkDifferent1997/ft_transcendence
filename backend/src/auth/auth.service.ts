/**
 * AuthService
 * -----------
 * Logique métier de l'authentification : vérifie qu'un email est
 * libre, hache le mot de passe, crée ou retrouve l'utilisateur en
 * base (via PrismaService). Séparé du contrôleur pour être
 * réutilisable et testable indépendamment du HTTP.
 */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from './hashing.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashing: HashingService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException('Email ou pseudo déjà utilisé.');
    }

    const passwordHash = await this.hashing.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
      },
    });

    return { id: user.id, email: user.email, username: user.username };
  }
}