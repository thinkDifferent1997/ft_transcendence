/**
 * EventsModule
 * ------------
 * Regroupe la gateway temps réel. Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GameModule } from '../game/game.module';

@Module({
	imports: [GameModule],
	providers: [EventsGateway],
})
export class EventsModule {}
