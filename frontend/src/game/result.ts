export function didPlayerWin
(
    playerScore: number,
    enemyScore: number,
    playerTime: number,
    enemyTime: number,
): boolean

{
    if (playerScore > enemyScore)
        return true;

    if (playerScore < enemyScore)
        return false;

    return playerTime < enemyTime;
}
