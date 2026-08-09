import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';

import { ValidationPipe, UsePipes } from '@nestjs/common';
import { Server } from 'socket.io';
// socket.io types Socket.data as `any`; AppSocket pins it to SocketData.
import type { AppSocket as Socket } from '../types/socket';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

//rate limit for messages
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 5000;

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly buckets = new Map<string, number[]>();
  constructor(private readonly chatService: ChatService) {}

  handleDisconnect(client: Socket) {
    this.buckets.delete(client.id);
  }
  @SubscribeMessage('send_message')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new WsException(
          errors.flatMap((e) => Object.values(e.constraints ?? {})),
        ),
    }),
  )
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatMessageDto,
  ) {
    if (!client.data.userId) {
      client.emit('message_error', { message: 'Not authenticated' });
      return;
    }
    if (!this.allow(client.id)) {
      client.emit('message_error', { message: 'Too many messages, slow down' });
      return;
    }
    try {
      const savedMessage = await this.chatService.saveGlobalMessage(
        client.data.userId,
        dto.content,
      );
      this.server.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('ERREUR WEBSOCKET (Envoi Message):', error);
      client.emit('message_error', { message: 'Could not send message' });
    }
  }
  private allow(id: string): boolean {
    const now = Date.now();
    const hits = (this.buckets.get(id) ?? []).filter(
      (t) => now - t < RATE_WINDOW_MS,
    );
    if (hits.length >= RATE_LIMIT) return false;
    hits.push(now);
    this.buckets.set(id, hits);
    return true;
  }
}
