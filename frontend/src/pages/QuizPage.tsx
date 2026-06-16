import { useState, useEffect } from "react";
import { questions } from "../data/questions";
import ScoreBoard from "../components/ScoreBoard";
import QuestionCard from "../components/QuestionCard";
import WaitingScreen from "../components/WaitingScreen";
import GameOverScreen from "../components/GameOverScreen";

export default function QuizPage()
{
	const [score, setScore] = useState(0);
	const [quest_index, set_quest_index] = useState(0);
	const [game_over, set_game_over] = useState(false);
	const [time_left, set_time_left] = useState(20);
	const [answered, set_answered] = useState(false);


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
				<GameOverScreen
					didWin = {score >= questions.length / 2}
					score = {score}
					maxScore = {questions.length}
				/>
			);
		}
		
		if (answered)
		{
			return (
				<div>
					<WaitingScreen
						score = {score}
						time_left = {time_left}
					/>
				</div>
			);
		}
		return (
			<div>
				<ScoreBoard
					score = {score}
					time_left = {time_left}
				/>
				<QuestionCard
					question={current_quest}
					onAnswer={handle_answer}
				/>
			</div>
		);
}
