import { useEffect, useState } from "react";
import { socket } from "../../socket/socket";
import { useLocation } from "react-router-dom";
import TournamentWait from "./TournamentWait.tsx";

interface TournamentLobbyTestProps {
    username: string;
    onBack: () => void;
    onStartGame: (matchData: any) => void;
	players: string[];
}

export default function TournamentLobbyTest({
    username,
    onBack,
	onStartGame,
}: TournamentLobbyTestProps)
{
	const location = useLocation();
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState<string[]>([]);

	useEffect(() => {
		socket.connect();

        socket.on("connect", () =>
        {
            setConnected(true);
        });

        socket.on("disconnect", () =>
        {
            setConnected(false);
        });

		 if (location.state?.tournamentId)
		{
			return;
		}

		socket.emit("join_tournament");

		socket.on("tournament_waiting", (data) => {
			setPlayers(data.players);
		});

		socket.on("match_found", (data) => {
			onStartGame(data);
		});

		return () => {
			socket.emit("leave_tournament");

			socket.off("connect");
			socket.off("disconnect");
			socket.off("tournament_waiting");
			socket.off("match_found");
		};
	}, []);
	return (
		<TournamentWait
			players={players}
			onBack={onBack}
		/>
	);
}
