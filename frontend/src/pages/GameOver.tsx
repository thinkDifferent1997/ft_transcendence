import { useLocation, useNavigate } from "react-router-dom";

export default function GameOverPage()
{
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as
    {
        playerScore: number;
        enemyScore: number;
		victory: boolean;
		draw:boolean;
    };

    let result = "Defeat";

	if (state.draw)
		result = "Draw";
	else if (state.victory)
		result = "Victory!";
	if (state.playerScore > state.enemyScore)
		result = "Victory!";
	else if (state.playerScore < state.enemyScore)
		result = "Defeat";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "80px",
                gap: "20px",
            }}
        >
            <h1>Game Over</h1>

            <h2>{result}</h2>

            <h3>
                {state.playerScore} - {state.enemyScore}
            </h3>

            <button
                onClick={() => navigate("/")}
            >
                Return to menu
            </button>
        </div>
    );
}
