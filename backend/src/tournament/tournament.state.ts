import { Injectable } from "@nestjs/common";

export interface BracketPlayer
{
	id: number;
	username: string;
}

export interface BracketMatch
{
	player1: BracketPlayer;
	player2: BracketPlayer;
	winner?: BracketPlayer;
}

export interface TournamentBracket
{
	semiFinal1?: BracketMatch;
	semiFinal2?: BracketMatch;
	final?: BracketMatch;
	semiFinal1Winner?: number;
	semiFinal2Winner?: number;
}

interface TournamentStateData
{
	semiFinal1RoomId: string;
	semiFinal2RoomId: string;
	bracket: TournamentBracket;
}

@Injectable()
export class TournamentState
{
	private tournaments = new Map<string, TournamentStateData>();

	// Retient qu'un finaliste a quitté le tournoi avant que la finale ne
	// démarre (l'autre demi-finale était encore en cours). Permet de
	// déclarer l'autre finaliste champion par forfait dès qu'il est connu,
	// au lieu de le laisser attendre indéfiniment un adversaire qui ne
	// viendra jamais.
	// userId est un identifiant string (uuid), pas un number.
	private finalForfeits = new Map<string, string>();

	markFinalForfeit(tournamentId: string, userId: string): void
	{
		this.finalForfeits.set(tournamentId, userId);
	}

	consumeFinalForfeit(tournamentId: string): string | undefined
	{
		const userId = this.finalForfeits.get(tournamentId);

		this.finalForfeits.delete(tournamentId);

		return userId;
	}

	registerTournament(
		tournamentId: string,
		semiFinal1RoomId: string,
		semiFinal2RoomId: string,
	): void
	{
		this.tournaments.set(tournamentId, {
			semiFinal1RoomId,
			semiFinal2RoomId,
			bracket: {},
		});
	}

	getTournament(tournamentId: string): TournamentStateData | undefined
	{
		return this.tournaments.get(tournamentId);
	}

	removeTournament(tournamentId: string): void
	{
		this.tournaments.delete(tournamentId);
	}

	findTournamentBySemiFinal(roomId: string): {
		tournamentId: string;
		data: TournamentStateData;
	} | null
	{
		for (const [tournamentId, data] of this.tournaments.entries())
		{
			if (
				data.semiFinal1RoomId === roomId ||
				data.semiFinal2RoomId === roomId
			)
			{
				return {
					tournamentId,
					data,
				};
			}
		}

		return null;
	}

	setSemiFinalWinner(
		tournamentId: string,
		roomId: string,
		winnerUserId: number,
	): void
	{
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament)
			return;

		if (tournament.semiFinal1RoomId === roomId)
		{
			const match = tournament.bracket.semiFinal1;

			if (match)
				match.winner =
					match.player1.id === winnerUserId
						? match.player1
						: match.player2;
		}

		if (tournament.semiFinal2RoomId === roomId)
		{
			const match = tournament.bracket.semiFinal2;

			if (match)
				match.winner =
					match.player1.id === winnerUserId
						? match.player1
						: match.player2;
		}

		console.log("Bracket updated:", tournament.bracket);
	}

	getBracket(tournamentId: string): TournamentBracket | null
	{
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament)
			return null;

		return tournament.bracket;
	}

	registerSemiFinalPlayers(
		tournamentId: string,
		roomId: string,
		player1: BracketPlayer,
		player2: BracketPlayer,
	): void
	{
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament)
			return;

		const match: BracketMatch = {
			player1,
			player2,
		};

		if (tournament.semiFinal1RoomId === roomId)
			tournament.bracket.semiFinal1 = match;
		else if (tournament.semiFinal2RoomId === roomId)
			tournament.bracket.semiFinal2 = match;
	}
}
