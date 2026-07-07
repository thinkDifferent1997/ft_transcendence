export function getDisplayedAnswers(
    answers: string[],
    correctAnswer: string,
    threeChoice: boolean,
    hideAnswer: boolean,
	hiddenAnswerIndex: number,
): string[]
{
    let displayedAnswers = [...answers];

    // Bonus ThreeChoice
    if (threeChoice)
    {
        displayedAnswers = displayedAnswers
            .filter(answer => answer !== correctAnswer)
            .slice(0, 2);

        displayedAnswers.push(correctAnswer);
    }

    // Bonus HideAnswer
    if (hiddenAnswerIndex !== -1)
    {
        displayedAnswers[hiddenAnswerIndex] =
            "This answer is hidden!";
    }

    return displayedAnswers;
}
