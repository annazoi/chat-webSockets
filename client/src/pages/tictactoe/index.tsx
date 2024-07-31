import { gameStore } from "../../store/gameStore";
import JoinRoom from "../joinGame";
import Game from "../game";
import { useEffect, useState } from "react";
import { API_URL } from "../../constants/api";
import io from "socket.io-client";

const TicTacToe = () => {
  const { isInRoom } = gameStore((state) => state);
  const [socket, setSocket] = useState<any>();
  const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => {
    const s = io(`${API_URL}`);
    setSocket(s);

    s.on("connect", () => {
      console.log("connected to socket", s.id);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("isInRoom", isInRoom);
  }, [isInRoom]);

  return (
    <div>
      {!joined && <JoinRoom socket={socket} setJoined={setJoined} />}
      {joined && <Game socket={socket} />}
    </div>
  );
};
export default TicTacToe;
