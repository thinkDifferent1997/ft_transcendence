import { Controller, Get , UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { FullAuthGuard } from '../auth/jwt/full-auth.guard';

@Controller('chat')
@UseGuards(FullAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('history')
    async getHistory() {
        try {
            return await this.chatService.getGlobalHistory();
        } catch (error) {
            console.error("Erreur récupération historique :", error);
            return [];
        }
    }
}
