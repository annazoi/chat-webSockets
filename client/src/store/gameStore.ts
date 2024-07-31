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

export const gameStore = create<GameState>()((set) => ({
  // ...initialStateValues,
  isInRoom: false,
  setInRoom: () => {},
  playerSymbol: "x",
  setPlayerSymbol: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  isGameStarted: false,
  setGameStarted: () => {},
}));

export const getGameState = (): GameState => {
  return gameStore.getState();
};
