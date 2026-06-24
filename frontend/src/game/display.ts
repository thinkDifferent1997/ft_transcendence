export function getDisplayedAnswers
(
    answers: string[],
    correctAnswer: string,
    threeChoice: boolean,
): string[]

{
    if (!threeChoice)
        return answers;

	/* filter (fonction javascript) verifie que dans answer, quelles reponses ne sont pas les bonnes
	* slice (idem) ne garde que deux reponses parmis les 3 fausses*/
    const displayedAnswers = answers
        .filter((answer) => answer !== correctAnswer)
        .slice(0, 2);

    displayedAnswers.push(correctAnswer);

    return displayedAnswers;
}
