import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface GameState {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSymbol: "x" | "o";
  setPlayerSymbol: (symbol: "x" | "o") => void;
  isPlayerTurn: boolean;
  setPlayerTurn: (turn: boolean) => void;
  isGameStarted: boolean;
  setGameStarted: (started: boolean) => void;
}

// const initialStateValues = {
//   isInRoom: false,
//   setInRoom: () => {},
//   playerSymbol: null,
//   setPlayerSymbol: () => {},
//   isPlayerTurn: false,
//   setPlayerTurn: () => {},
//   isGameStarted: false,
//   setGameStarted: () => {},
// };

export const gameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        isInRoom: false,
        setInRoom: (inRoom: boolean) => set({ isInRoom: inRoom }),
        playerSymbol: "x",
        setPlayerSymbol: (symbol: "x" | "o") => set({ playerSymbol: symbol }),
        isPlayerTurn: false,
        setPlayerTurn: (turn: boolean) => set({ isPlayerTurn: turn }),
        isGameStarted: false,
        setGameStarted: (started: boolean) => set({ isGameStarted: started }),
      }),
      {
        name: "game-store",
        onRehydrateStorage: () => (state: any) => {
          state.setInRoom(false);
        },
      }
    )
  )
);

export const getGameState = (): GameState => {
  return gameStore.getState();
};
