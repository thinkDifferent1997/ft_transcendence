export function updateCorrectStreak
(
    streak: number,
    isCorrect: boolean,
): number

{
    if (isCorrect)
        return streak + 1;

    return 0;
}

export function hasThreeChoiceBonus
(
    streak: number,
): boolean

{
    return streak >= 3;
}
