import { useEffect, useState } from "react";
import { gameStore } from "../../store/gameStore";
import gameService from "../../services/gameService";

const JoinGame = ({ socket, setJoined }: any) => {
  const [roomName, setRoomName] = useState<string>("");
  const [isJoining, setJoining] = useState<boolean>(false);

  const { setInRoom } = gameStore((state) => state);

  const handleRoomNameChange = (e: any) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Joining room", roomName);

    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    try {
      const joined = await gameService.joinGameRoom(socket, roomName);
      if (joined) setInRoom(true);
      console.log("joined", joined);
      if (joined) setJoined(true);
    } catch (err) {
      alert(err);
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    console.log("socket useEffect", socket);
  }, [socket]);

  return (
    <form onSubmit={joinRoom}>
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
      {/* <div>{socket}</div> */}
    </form>
  );
};
export default JoinGame;
