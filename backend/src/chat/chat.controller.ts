import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory() {
    try {
      return await this.chatService.getGlobalHistory();
    } catch (error) {
      console.error('Erreur récupération historique :', error);
      return [];
    }
  }
}
