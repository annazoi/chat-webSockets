import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface GameState {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSymbol: any;
  setPlayerSymbol: (symbol: any) => void;
  setPlayerTurn: (isPlayerTurn: boolean) => void;
  isPlayerTurn: boolean;
  setGameStarted: (isGameStarted: boolean) => void;
  isGameStarted: boolean;
}

const initialStateValues = {
  isInRoom: false,
  setInRoom: () => {},
  playerSymbol: null,
  setPlayerSymbol: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  isGameStarted: false,
  setGameStarted: () => {},
};

export const gameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        ...initialStateValues,
        isInRoom: false,
        setInRoom: (inRoom: boolean) => {
          set({
            isInRoom: inRoom,
          });
        },
        playerSymbol: null,
        setPlayerSymbol: (symbol: any) => {
          set({
            playerSymbol: symbol,
          });
        },
        isPlayerTurn: false,
        setPlayerTurn: (isPlayerTurn: boolean) => {
          set({
            isPlayerTurn: isPlayerTurn,
          });
        },
        isGameStarted: false,
        setGameStarted: (isGameStarted: boolean) => {
          set({
            isGameStarted: isGameStarted,
          });
        },
      }),
      {
        name: "chat-game",
      }
    )
  )
);

export const getGameState = (): GameState => {
  return gameStore.getState();
};
