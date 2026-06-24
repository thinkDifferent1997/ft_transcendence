/**
 * EventsGateway
 * -------------
 * Porte d'entrée temps réel (WebSocket via Socket.IO).
 * Équivalent d'un contrôleur, mais pour les événements temps réel.
 * Pour l'instant : un simple ping/pong pour valider la connexion
 * de bout en bout (front -> nginx -> backend).
 */
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ 
	path: '/ws',
	cors: {
		origin: '*', //to be changed to later by our domain name. * allows everything
		credentials: true,
	},
})
export class EventsGateway {
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    console.log(`ping reçu de ${client.id}`);
    return 'pong';
  }
}
