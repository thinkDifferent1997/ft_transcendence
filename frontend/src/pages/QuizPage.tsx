import { useState } from "react";

export default function QuizPage()
{
	const [score, setScore] = useState(0);
	const [quest_index, set_quest_index] = useState(0);

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

	function	handle_answer(answer: string)
	{
		if (answer === current_quest.correct)
			setScore(score + 1);

		set_quest_index(quest_index + 1);
	}

	return (
		<div>
		<h1>{current_quest.question}</h1>

		<p>Score : {score}</p>

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
