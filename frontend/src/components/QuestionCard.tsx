import type { Question } from "../types/question";

type QuestionCardProps =
{
	question: Question;
	answers: string[];
	onAnswer: (answer: string) => void;
};

export default function QuestionCard
(
	{
		question,
		answers,
		onAnswer,
	}: QuestionCardProps
)

{
	return (
		<div>
			<h1>{question.question}</h1>
			{answers.map((answer) =>
			(
				<button
				key = {answer}
				onClick = {() => onAnswer(answer)} >
					{answer}
				</button>
			))}
		</div>
	);
}
