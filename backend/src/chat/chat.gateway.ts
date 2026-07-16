import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ 
	cors: {
		origin: true,
		credentials: true,
	}
})

export class ChatGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) {}

	@SubscribeMessage('send_message')
	async handleMessage(
		@MessageBody() data: { authorId: string, content: string }
	) {
		try {
			const savedMessage = await this.chatService.saveGlobalMessage(
				data.authorId,
				data.content
			);

		this.server.emit('receive_message', savedMessage);
	} catch (error) {
		console.log("ERROR WHILE SENDING THE MESSAGE:", error);

		}
	}
}

