export function updateCorrectStreak
(
    streak: number,
    isCorrect: boolean,
): number

{
    if (isCorrect && streak >= 0)
        return streak + 1;
	else if (isCorrect && streak < 0)
		return 1;
	else if (!isCorrect && streak >= 0)
		return (-1);
	else
		return streak - 1;
}

export function hasThreeChoiceBonus
(
    streak: number,
): boolean

{
    return streak >= 3;
}
