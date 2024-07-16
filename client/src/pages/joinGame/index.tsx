import { useState } from "react";
import { gameStore } from "../../store/gameStore";

const JoinGame = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [isJoining, setJoining] = useState<boolean>(false);

  const { setInRoom } = gameStore((state) => state);

  const handleRoomNameChange = (e: any) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    // const socket = socketService.socket;
    // if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    // const joined = await gameService
    //   .joinGameRoom(socket, roomName)
    //   .catch((err) => {
    //     alert(err);
    //   });

    // if (joined) setInRoom(true);

    setJoining(false);
  };

  return (
    // <form onSubmit={joinRoom}>
    <div>
      <h4>Enter Room ID to Join the Game</h4>
      <input
        placeholder="Room ID"
        value={roomName}
        onChange={handleRoomNameChange}
      />
      <button type="submit" disabled={isJoining}>
        {isJoining ? "Joining..." : "Joing"}
      </button>
    </div>
    // </form>
  );
};
export default JoinGame;
