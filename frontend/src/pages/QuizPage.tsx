import { useState, useEffect } from "react";
import { questions } from "../data/questions";
import ScoreBoard from "../components/ScoreBoard";
import QuestionCard from "../components/QuestionCard";
import WaitingScreen from "../components/WaitingScreen";
import GameOverScreen from "../components/GameOverScreen";
import PlayerBonusPanel from "../components/PlayerBonus";

import type { PlayerState } from "../types/PlayerState";
import type { GameState } from "../types/GameState";

import { isCorrectAnswer } from "../game/answer";
import { updateCorrectStreak } from "../game/bonus";
import { getDisplayedAnswers } from "../game/display";

export default function QuizPage()
{
	const player: PlayerState = {
			score: 0,
			answered: false,
			totalTimeUsed: 0,
			streak: 0,
			hideAnswer: false,
			threeChoice: false,
			doublePoint: false,
		};

	const [game, setGame] = useState<GameState>(
		{
			currentQuestion: questions[0],
			questionIndex: 0,
			time_left: 20,
			localPlayer: { ...player},
			enemyPlayer: { ...player},
			gameOver: false,
		});


	function nextQuestion()
	{
		if (game.questionIndex + 1 >= questions.length)
		{
			setGame((previousGame) => ({
				...previousGame,
				gameOver: true,
			}));
			return;
		}

		setGame((previousGame) => ({
			...previousGame,

			questionIndex: previousGame.questionIndex + 1,
			currentQuestion: questions[previousGame.questionIndex + 1],
			time_left: 20,

			localPlayer: {
				...previousGame.localPlayer,

				answered: false,
				threeChoice: false,
				hideAnswer: false,
			},
			enemyPlayer:
			{
					...previousGame.enemyPlayer,
					answered: false,
			},
		}));
	}

	function	handle_answer(answer: string)
	{
		if (game.localPlayer.answered)
			return;

		const	isCorrect = isCorrectAnswer(answer, game.currentQuestion.correct);

		const newStreak = updateCorrectStreak(game.localPlayer.streak, isCorrect);
		let three = false;
		let five = false;
		let negatif = false;
		let new_score = game.localPlayer.score;

		if (newStreak === 3)
			three = true;
		else if (newStreak === 5)
			five = true;
		else if (newStreak <= -5)
			negatif = true;

		if (isCorrect)
		{
			if (game.localPlayer.doublePoint)
			{
				negatif = false;
				new_score += 2;
			}
			else
				new_score += 1;
		}

console.log(
    "Ancien streak :", game.localPlayer.streak,
    "Nouveau :", newStreak,
);

		setGame((previousGame) => (
		{
			...previousGame,
			localPlayer: {
				...previousGame.localPlayer,
				answered: true,
				streak: newStreak,
				threeChoice: three,
				doublePoint: negatif,
				hideAnswer: five,
				score: new_score,
			},
		}));
		setTimeout(fakeEnemyAnswer, 500);
	}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!FAKE IA QUI N'EST PAS OPTI DU TOUT C'EST JUSTE POUR TESTER!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	function fakeEnemyAnswer()
	{
			const isCorrect = Math.random() < 0.7;

			setGame((previousGame) => ({
					...previousGame,
					enemyPlayer: {
							...previousGame.enemyPlayer,
							answered: true,
							score: isCorrect
									? previousGame.enemyPlayer.score + 1
									: previousGame.enemyPlayer.score,
					},
			}));
	}

	useEffect(() =>
		{
			//set Interval will restart the timer each time the question changes
			//set time left every 1000ms, means each sec
			const timer = setInterval(() => 
					{
						setGame((previousGame) => (
							{
								...previousGame,
								time_left: previousGame.time_left - 1,
							}));
					}, 1000);

					return () => clearInterval(timer);
		}, [game.questionIndex]);
	
	useEffect(() =>
			  {
				  if (game.time_left  < 0)
					  nextQuestion();
			  }, [game.time_left]);

	if (game.gameOver)
		{
			//return GameOver component
			return (
				<GameOverScreen
					didWin = {game.localPlayer.score >= questions.length / 2}
					score = {game.localPlayer.score}
					maxScore = {questions.length}
				/>
			);
		}
		
		if (game.localPlayer.answered)
		{
			return (
				<div>
					<WaitingScreen
						score = {game.localPlayer.score}
						enemyScore = {game.enemyPlayer.score}
						time_left = {game.time_left}
					/>
					<PlayerBonusPanel
						streak={game.localPlayer.streak}
						threeChoice={game.localPlayer.threeChoice}
						hideAnswer={game.localPlayer.hideAnswer}
						doublePoint={game.localPlayer.doublePoint}
					/>
				</div>
			);
		}


		// For bonus 3 choices : we take out the right answer, choose only 2 answers, put back the right answer


		const displayedAnswers = getDisplayedAnswers(game.currentQuestion.answers, game.currentQuestion.correct, game.localPlayer.threeChoice);

		return (
			<div>
				<ScoreBoard
					score = {game.localPlayer.score}
					enemyScore = {game.enemyPlayer.score}
					time_left = {game.time_left}
				/>
				<PlayerBonusPanel
          			streak={game.localPlayer.streak}
					threeChoice={game.localPlayer.threeChoice}
					hideAnswer={game.localPlayer.hideAnswer}
					doublePoint={game.localPlayer.doublePoint}
				/>
				<QuestionCard
					question={game.currentQuestion}
					answers={displayedAnswers}
					onAnswer={handle_answer}
				/>
				<p>
					Adversaire :
					{" "}
					{game.enemyPlayer.answered
							? "Answered."
							: "Still thinking..."}
				</p>
			</div>
		);
}
