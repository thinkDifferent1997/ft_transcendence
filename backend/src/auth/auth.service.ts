/**
 * AuthService
 * -----------
 * Logique métier de l'authentification : vérifie qu'un email est
 * libre, hache le mot de passe, crée ou retrouve l'utilisateur en
 * base (via PrismaService). Séparé du contrôleur pour être
 * réutilisable et testable indépendamment du HTTP.
 */
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
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
			throw new ConflictException('email or pseudo already used!.');
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


	async	login(dto:any) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
	});
	if (!user || !user.passwordHash) {
		throw new UnauthorizedException('Incorrect Credentials');
	}

	const isPasswordValid = await this.hashing.verify(user.passwordHash, dto.password);
	if (!isPasswordValid) {
		throw new UnauthorizedException('Incorrect Credentials');
	}
	console.log(`Connexion succesfull: ${user.username}`);

	return {
		id: user.id,
		username: user.username,
		isTwoFactorEnabled: user.isTwoFactorEnabled,
	};
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
			id: user.id,
			username: user.username,
			isTwoFactorEnabled: user.isTwoFactorEnabled,
		};
	}

	async loginOrCreateGithubUser(profile: any) {
		let user = await this.prisma.user.findUnique({
			where: { githubId: String(profile.githubID) },
		});
		if (user) return user;

		const existing = await this.prisma.user.findUnique({
			where: { email: profile.email },
		});
		if (existing) {
			return this.prisma.user.update({
				where: { id: existing.id },
				data: { githubId: String(profile.githubID) },
			});
		}

		let username = profile.username;
		const clash = await this.prisma.user.findUnique({ where: { username } });
		if (clash) username = `${username}_${profile.githubID}`;
		
		return this.prisma.user.create({
			data: {
				githubId: String(profile.githubID),
				username,
				email: profile.email,
				avatarUrl: profile.avatarUrl,
				},
			});
	}
}
