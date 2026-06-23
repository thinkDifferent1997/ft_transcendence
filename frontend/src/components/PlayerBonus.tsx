type PlayerBonusProps =
	{
	correctStreak : number;
	threeChoice : boolean;
	hideAnswer : boolean;
	doublePoint : boolean;
};

export default function PlayerBonus
(
	{
		correctStreak,
		threeChoice,
		hideAnswer,
		doublePoint,
	}: PlayerBonusProps
)

{
	return (
		 <div>
            <h2>Bonus</h2>

            <p>
                Série actuelle : {correctStreak}
            </p>

            <p>
                Trois choix :
                {" "}
                {threeChoice ? "Up" : "X"}
            </p>

            <p>
                Cacher une réponse :
                {" "}
                {hideAnswer ? "Up" : "X"}
            </p>

            <p>
                Double point :
                {" "}
                {doublePoint ? "Up" : "X"}
            </p>
        </div>
	);
}
