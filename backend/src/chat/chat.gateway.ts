import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*'} })
export class ChatGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) {}

	@SubscribeMessage('send_message')
	async handleMessage(
		@MessageBody() data: { authorId: string, content: string }
	) {
		console.log("[GATEWAY] Message reçu du frontend :", data); // LE MOUCHARD BACKEND
		try {
			const savedMessage = await this.chatService.saveGlobalMessage(
				data.authorId,
				data.content
			);

		console.log("[GATEWAY] Message sauvegarde :", data); // LE MOUCHARD BACKEND
		this.server.emit('received_message', savedMessage);
	} catch (error) {
		console.log("[GATEWAY] ERREUR :", data); // LE MOUCHARD BACKEND

	}
}}

