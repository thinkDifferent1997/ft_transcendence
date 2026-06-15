import { useState, useEffect } from "react";

export default function QuizPage()
{
	const [score, setScore] = useState(0);
	const [quest_index, set_quest_index] = useState(0);
	const [game_over, set_game_over] = useState(false);
	const [time_left, set_time_left] = useState(20);
	const [answered, set_answered] = useState(false);

	const questions =
		[
		{
			question: "Quelle est la capitale de la France ?",
			answers: ["Paris", "Rome", "Berlin", "Madrid"],
			correct: "Paris",
		},
		{
			question: "2 + 2 = ?",
				answers: ["2", "3", "4", "5"],
			correct: "4",
		},
	];

	const	current_quest = questions[quest_index];

	
	function	next_question()
	{
		if (quest_index + 1 >= questions.length)
		{	
			set_game_over(true);
			return ;
		}
		set_time_left(20);
		set_quest_index(quest_index + 1);
	}

	function	handle_answer(answer: string)
	{
		if (answered)
			return ;

		set_answered(true);
		
		if (answer === current_quest.correct)
			setScore(score + 1);

		next_question();
	}

	useEffect(() =>
		{
			const timer = setInterval(() => 
					{
						set_time_left((previous_time) => previous_time - 1);
					}, 1000);

					return () => clearInterval(timer);
		}, [quest_index]); //Le timer changera a chaque fois que quest_index est modifie
	
	useEffect(() =>
			  {
				  if (time_left  < 0)
					  next_question();
			  }, [time_left]);

	if (game_over)
		{
			return (
				<div>
				<h1>Fin de Partie !</h1>
				<p>
				Score final : {score} / {questions.length}
				</p>
				</div>
			);
		}
		return (
			<div>
			<p>Score : {score} Temps restant : {time_left}</p>
			<h1>{current_quest.question}</h1>


			{current_quest.answers.map((answer) => (
				<button key={answer}
				onClick={() => handle_answer(answer)}
				>
				{answer}
				</button>
			))}
			</div>
		);
}
