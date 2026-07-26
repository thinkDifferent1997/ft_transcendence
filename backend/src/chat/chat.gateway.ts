import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ 
	path: '/ws',
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
            // Ici data.authorId contient le pseudonyme envoyé par le frontend
			console.log("📨 Message reçu du front :", data); // 👈 Ajoute ceci pour voir si le message arrive bien ici
            const savedMessage = await this.chatService.saveGlobalMessage(
                data.authorId,
                data.content
            );
			console.log("✅ Message sauvegardé avec succès :", savedMessage); // 👈 Pour voir si Prisma valide
            this.server.emit('receive_message', savedMessage);
        } catch (error) {
            console.error("ERREUR WEBSOCKET (Envoi Message):", error);
        }
    }
}
