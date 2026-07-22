import { useEffect, useState } from "react";
import { socket } from "../../socket/socket";

interface TournamentLobbyTestProps {
    username: string;
    onBack: () => void;
    onStartGame: (matchData: any) => void;
}

export default function TournamentLobbyTest({
    username,
    onBack,
	onStartGame,
}: TournamentLobbyTestProps)
{
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState(0);

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

		console.log("EMIT join_tournament");
		socket.emit("join_tournament");

		socket.on("tournament_waiting", (data) => {
			setPlayers(data.players);
		});

		socket.on("match_found", (data) => {
			console.log("MATCH FOUND", data);
			onStartGame(data);
		});

		return () => {
            socket.off("connect");
            socket.off("disconnect");
			socket.off("tournament_waiting");
			socket.off("match_found");
		};
	}, []);

    return (
        <div>
            <h1>Tournament</h1>

            <p>Player : {username}</p>

            <p>
                Status :
                {connected ? " Connected" : " Disconnected"}
            </p>

            <p>
                Players :
                {players}/4
            </p>

            <br /><br />

            <button onClick={onBack}>
                Back
            </button>
        </div>
    );
}
