import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { authorId: string; content: string },
  ) {
    try {
      console.log('📨 Message reçu du front :', data);
      if (!client.data.userId)
        throw new Error('User not recognized by WebSocket');
      const savedMessage = await this.chatService.saveGlobalMessage(
        client.data.userId,
        data.content,
      );
      console.log('✅ Message sauvegardé avec succès :', savedMessage);
      this.server.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('ERREUR WEBSOCKET (Envoi Message):', error);
    }
  }
}
