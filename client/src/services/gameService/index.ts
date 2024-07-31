export type IPlayMatrix = Array<Array<string | null>>;
export interface IStartGame {
  start: boolean;
  symbol: "x" | "o";
}

class GameService {
  public async joinGameRoom(socket: any, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }: any) => rj(error));
    });
  }

  public async updateGame(socket: any, gameMatrix: IPlayMatrix) {
    socket.emit("update_game", { matrix: gameMatrix });
  }

  public async onGameUpdate(
    socket: any,
    listiner: (matrix: IPlayMatrix) => void
  ) {
    socket.on("on_game_update", ({ matrix }: any) => listiner(matrix));
  }

  public async onStartGame(
    socket: any,
    listiner: (options: IStartGame) => void
  ) {
    socket.on("start_game", listiner);
  }

  public async gameWin(socket: any, message: string) {
    socket.emit("game_win", { message });
  }

  public async onGameWin(socket: any, listiner: (message: string) => void) {
    socket.on("on_game_win", ({ message }: any) => listiner(message));
  }
}

export default new GameService();
