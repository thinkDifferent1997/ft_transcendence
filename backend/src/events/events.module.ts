/**
 * EventsModule
 * ------------
 * Regroupe la gateway temps réel. Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GameModule } from '../game/game.module';
import { JwtAuthModule } from "../auth/jwt/jwt-auth.module";

@Module({
	imports: [GameModule, JwtAuthModule],
	providers: [EventsGateway],
})
export class EventsModule {}
