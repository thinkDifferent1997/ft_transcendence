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

  async loginOrCreate42User(profile: any) {
	  const rawId = profile?.fortyTwoID;
	  if (!rawId){
		  console.error("Error: the structure is not valid: ", profile);
		  throw new Error("The 42 ID extraction from profile passport failed");
		 }
	  const fortyTwoIdString = rawId.toString();
	  let user = await this.prisma.user.findUnique({
		  where: { fortyTwoId: fortyTwoIdString },
	  });

	  if (!user) {
		  user = await this.prisma.user.create({
			  data: {
				  fortyTwoId: fortyTwoIdString,
				  username: profile.username || 'dummy_42',
				  email: profile.email,
				  avatar: profile.avatarUrl || null,
				 },
		  });
		  console.log('New User created in: ', user.username);
	  }
	  else{
		  console.log('Already existing user found: ', user.username);
	  }

	  return {
		  id:user.id,
		  username:user.username,
		  token: 'fake-jwt-token'
		};
	}
}
