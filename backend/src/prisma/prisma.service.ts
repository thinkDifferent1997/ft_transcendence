/**
 * PrismaService
 * -------------
 * Connexion unique et partagée à la base PostgreSQL (via Prisma).
 * Hérite de PrismaClient : expose directement .user.create(),
 * .user.findUnique(), etc. Ouvre la connexion au démarrage du module.
 * Tout accès à la base de l'application passe par ce service.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect();
	}
}
