import { useEffect, useState } from "react";
import { socket } from "../../socket/socket"; // adapte le chemin si besoin

interface TournamentLobbyTestProps {
    username: string;
    onBack: () => void;
    onStartGame: () => void;
}

export default function TournamentLobbyTest({
    username,
    onBack,
}: TournamentLobbyTestProps)
{
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState(0);

    useEffect(() =>
    {
        socket.connect();

        socket.on("connect", () =>
        {
            setConnected(true);
        });

        socket.on("disconnect", () =>
        {
            setConnected(false);
        });

        socket.on("tournament_waiting", (data) =>
        {
            setPlayers(data.players);
        });

        return () =>
        {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("tournament_waiting");
        };
    }, []);

    function joinTournament()
    {
        socket.emit("join_tournament");
    }

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

            <button onClick={joinTournament}>
                Join tournament
            </button>

            <br /><br />

            <button onClick={onBack}>
                Back
            </button>
        </div>
    );
}
