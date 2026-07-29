import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
    isInGame: boolean;
    setIsInGame: (value: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode })
{
    const [isInGame, setIsInGame] = useState(false);

    return (
        <GameContext.Provider value={{ isInGame, setIsInGame }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame()
{
    const context = useContext(GameContext);

    if (!context)
        throw new Error("useGame must be used inside GameProvider");

    return context;
}
