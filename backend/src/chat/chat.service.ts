import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async saveGlobalMessage(username: string, content: string) {
        // 1. On cherche le vrai ID de l'utilisateur à partir de son pseudonyme
        const user = await this.prisma.user.findUnique({
            where: { username }
        });

        if (!user) throw new Error("Utilisateur introuvable dans la base de données");

        // 2. On sauvegarde le message avec le véritable ID
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
        // On récupère l'historique avec les infos des auteurs
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
