import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async saveGlobalMessage(userId: string, content: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) throw new Error("The user does not exist in the DataBase");

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
