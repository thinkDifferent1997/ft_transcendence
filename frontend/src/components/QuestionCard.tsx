import type { Question } from "../types/question";

type QuestionCardProps =
{
	question: Question;
	onAnswer: (answer: string) => void;
};

export default function QuestionCard
(
	{
		question,
		onAnswer,
	}: QuestionCardProps
)

{
	return (
		<div>
			<h1>{question.question}</h1>
			{question.answers.map((answer) =>
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
