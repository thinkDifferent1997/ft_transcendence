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
			correctStreak: 0,
			wrongStreak: 0,
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


	function	next_question()
	{
		if (game.questionIndex + 1 >= questions.length)
		{	
			setGame((previousGame) => (
				{
					...previousGame,
					gameOver: true,
				}));
			return ;
		}
		if (game.localPlayer.threeChoice)

			setGame((previousGame) => (
			{
				...previousGame,
				currentQuestion: questions[game.questionIndex + 1],
				questionIndex:game.questionIndex + 1,
				time_left: 20,
				localPlayer: {
					...previousGame.localPlayer,
					answered: false,
					threeChoice: false,
				},
			}));
		else
			setGame((previousGame) => (
			{
				...previousGame,
				currentQuestion: questions[game.questionIndex + 1],
				questionIndex: game.questionIndex + 1,
				time_left: 20,
				localPlayer: {
					...previousGame.localPlayer,
					answered: false,
				},
			}));
	}

	function	handle_answer(answer: string)
	{
		if (game.localPlayer.answered)
			return;

		setGame((previousGame) => (
		{
			...previousGame,
			localPlayer: {
				...previousGame.localPlayer,
				answered: true,
			},
		}));

		const	isCorrect = isCorrectAnswer(answer, game.currentQuestion.correct);

//		setCorrectStreak(updateCorrectStreak(correctStreak, isCorrect));
		const newStreak = updateCorrectStreak(game.localPlayer.correctStreak, isCorrect);
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
			new_score = game.localPlayer.score + 1;

		setGame((previousGame) => (
		{
			...previousGame,
			localPlayer: {
				...previousGame.localPlayer,
				threeChoice: three,
				doublePoint: negatif,
				hideAnswer: five,
				score: new_score,
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
					  next_question();
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
						time_left = {game.time_left}
					/>
					<PlayerBonusPanel
						correctStreak={game.localPlayer.correctStreak}
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
					enemyScore = {game.localPlayer.score}
					time_left = {game.time_left}
				/>
				<PlayerBonusPanel
          			correctStreak={game.localPlayer.correctStreak}
					threeChoice={game.localPlayer.threeChoice}
					hideAnswer={game.localPlayer.hideAnswer}
					doublePoint={game.localPlayer.doublePoint}
				/>
				<QuestionCard
					question={game.currentQuestion}
					answers={displayedAnswers}
					onAnswer={handle_answer}
				/>
			</div>
		);
}
