/**
 * EventsModule
 * ------------
 * Regroupe la gateway temps réel. Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {}