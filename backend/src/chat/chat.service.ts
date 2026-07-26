import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async saveGlobalMessage(username: string, content: string) {
		const user = await this.prisma.user.findUnique({
			where: { username }
		});

		if (!user) throw new Error("Utilisateur introuvable dans la base de données");

		return this.prisma.globalMessage.create({
			data: {
				content,
				authorId: user.id,
			},
			include: {
				author: {
					select: {
						username: true,
						avatar: true,
						status: true,
					},
				},
			},
		});
	}

	async getGlobalHistory() {
		return this.prisma.globalMessage.findMany({
			include: {
				author: {
					select: {
						username: true,
						avatar: true,
						status: true,
					},
				},
			},
		});
	}
}
