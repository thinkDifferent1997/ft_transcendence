import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class TournamentQueue
{
	private waitingPlayers: Socket[] = [];
	private tournamentStarting = false;

	isTournamentStarting(): boolean
	{
		return this.tournamentStarting;
	}

	setTournamentStarting(value: boolean): void
	{
		this.tournamentStarting = value;
	}

	addPlayer(client: Socket): void
	{
		const existingIndex = this.waitingPlayers.findIndex(
			player => player.data.userId === client.data.userId,
		);

		if (existingIndex !== -1)
			this.waitingPlayers.splice(existingIndex, 1);

		this.waitingPlayers.push(client);
	}

	removePlayer(client: Socket): boolean
	{
		const index = this.waitingPlayers.findIndex(
			player => player.id === client.id,
		);

		if (index === -1)
			return false;

		this.waitingPlayers.splice(index, 1);

		return true;
	}

	getPlayers(): Socket[]
	{
		this.waitingPlayers = this.waitingPlayers.filter(
			player => player.connected,
		);

		return [...this.waitingPlayers];
	}

	getUsernames(): string[]
	{
		return this.waitingPlayers.map(
			player => player.data.username,
		);
	}

	clear(): void
	{
		this.waitingPlayers = [];
	}
}
