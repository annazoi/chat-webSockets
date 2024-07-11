import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { API_URL } from "../../constants/api";
import Peer from "simple-peer";
import { FaPhoneAlt } from "react-icons/fa";

const VideoCall = () => {
  const [me, setMe] = useState<string>("");
  const [stream, setStream] = useState<any>();
  const [receivingCall, setReceivingCall] = useState<boolean>(false);
  const [caller, setCaller] = useState<string>("");
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [idToCall, setIdToCall] = useState<string>("");
  const [callEnded, setCallEnded] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [socket, setSocket] = useState<any>();
  const myVideo = useRef<any>(null);
  const userVideo = useRef<any>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    const s = io(`${API_URL}`);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
        console.log("stream", stream);
      });
    socket?.on("me", (id: string) => {
      setMe(id);
    });
    socket?.on("callUser2", (data: any) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
      console.log("callUser2", data);
    });
  }, [socket]);

  const callUser = (id: string) => {
    console.log("callUser", id);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer?.on("signal", (data) => {
      socket.emit("callUser2", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer?.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted2", (signal: any) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer?.on("signal", (data) => {
      socket.emit("answerCall2", { signal: data, to: caller });
    });
    peer?.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Video Call</h1>
      <div>
        <div>
          <div>
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            )}
          </div>
          <div>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            ) : null}
          </div>
        </div>
        <div>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          {/* <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <button
              color="primary"
              // startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </button>
          </CopyToClipboard> */}

          <input
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div>
            {callAccepted && !callEnded ? (
              <button onClick={leaveCall}>End Call</button>
            ) : (
              <button onClick={() => callUser(idToCall)}>
                <FaPhoneAlt />
              </button>
            )}
            {idToCall}
          </div>
          <div>{me}</div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default VideoCall;
