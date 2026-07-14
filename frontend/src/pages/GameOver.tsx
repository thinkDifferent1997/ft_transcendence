interface GameOverProps {
	data: {
		playerScore: number;
		enemyScore: number;
		victory: boolean;
		draw: boolean;
	};
	onBack?: () => void;
}

export default function GameOverPage({ data, onBack }: GameOverProps) {
    const { playerScore, enemyScore, victory, draw } = data;

    let result = "Defeat";
    if (draw) result = "Draw";
    else if (victory) result = "Victory!";
    
    if (playerScore > enemyScore) result = "Victory!";
    else if (playerScore < enemyScore) result = "Defeat";

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px", gap: "20px" }}>
            <h1>Game Over</h1>
            <h2>{result}</h2>
            <h3>{playerScore} - {enemyScore}</h3>
            
            <button onClick={onBack} className="px-4 py-2 bg-purple-500 text-white rounded-lg">
                Return to menu
            </button>
        </div>
    );
}
