import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async saveGlobalMessage(authorId: string, content: string) {
		return this.prisma.globalMessage.create({
			data: {
				content,
				authorId,
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
}
