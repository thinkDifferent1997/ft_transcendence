/**
 * Typed Socket.IO socket for this application.
 *
 * socket.io declares `Socket.data` as `any`, so every `socket.data.userId`
 * read was an unchecked property access — 55 of them across the gateways,
 * which is where most of the no-unsafe-* lint errors came from. Pinning the
 * 4th generic to SocketData types all of them at once.
 */
import type { DefaultEventsMap, Socket } from 'socket.io';

/**
 * Everything the gateways stash on `socket.data` during the handshake.
 *
 * Both fields are declared required even though they are only populated once
 * EventsGateway.handleConnection has authenticated the client. Every gateway
 * already reads them unguarded, so modelling them as optional would surface
 * those pre-existing null-safety gaps as compile errors — worth doing, but a
 * separate piece of work from typing `data`.
 */
export interface SocketData {
  /** `User.id` (UUID string), taken from the JWT `sub` claim. */
  userId: string;
  /** Display name, taken from the JWT `username` claim. */
  username: string;
}

export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
