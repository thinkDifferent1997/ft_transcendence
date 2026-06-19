import { useState, useEffect } from "react";
import { questions } from "../data/questions";
import ScoreBoard from "../components/ScoreBoard";
import QuestionCard from "../components/QuestionCard";
import WaitingScreen from "../components/WaitingScreen";
import GameOverScreen from "../components/GameOverScreen";
import PlayerBonusPanel from "../components/PlayerBonus";

import { isCorrectAnswer } from "../game/answer";
import { hasThreeChoiceBonus, updateCorrectStreak} from "../game/bonus";
import { getDisplayedAnswers } from "../game/display";

export default function QuizPage()
{
	const [score, setScore] = useState(0);
	const [questIndex, setQuestIndex] = useState(0);
	const [game_over, set_game_over] = useState(false);
	const [time_left, set_time_left] = useState(20);
	const [answered, set_answered] = useState(false);
	const [correctStreak, setCorrectStreak] = useState(0);
	
	const hideAnswer = false;
	const doublePoint = false;
	const threeChoice = hasThreeChoiceBonus(correctStreak);

	const	currentQuestion = questions[questIndex];
	
	function	next_question()
	{
		if (questIndex + 1 >= questions.length)
		{	
			set_game_over(true);
			return ;
		}
		set_time_left(20);
		setQuestIndex(
			(previousQuestIndex) => previousQuestIndex + 1);
	}

	function	handle_answer(answer: string)
	{
		if (answered)
			return;

		set_answered(true);

		const	isCorrect = isCorrectAnswer(
			answer,
			currentQuestion.correct
		);

		setCorrectStreak(
			updateCorrectStreak(
				correctStreak,
				isCorrect,
			),
		);
		if (isCorrect)
			setScore(
			(previousScore) => previousScore + 1);
	}

	useEffect(() =>
		{
			const timer = setInterval(() => 
					{
						set_time_left((previous_time) => previous_time - 1);
					}, 1000);

					return () => clearInterval(timer);
		}, [questIndex]); //Le timer changera a chaque fois que questIndex est modifie
	
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
					<PlayerBonusPanel
						correctStreak={correctStreak}
						threeChoice={threeChoice}
						hideAnswer={hideAnswer}
						doublePoint={doublePoint}
					/>
				</div>
			);
		}


		// For bonus 3 choices : we take out the right answer, choose only 2 answers, put back the right answer


		const displayedAnswers = getDisplayedAnswers(
			currentQuestion.answers,
			currentQuestion.correct,
			threeChoice
		);

		return (
			<div>
				<ScoreBoard
					score = {score}
					enemyScore = {score}
					time_left = {time_left}
				/>
				<PlayerBonusPanel
          			correctStreak={correctStreak}
					threeChoice={threeChoice}
					hideAnswer={hideAnswer}
					doublePoint={doublePoint}
				/>
				<QuestionCard
					question={currentQuestion}
					answers={displayedAnswers}
					onAnswer={handle_answer}
				/>
			</div>
		);
}
