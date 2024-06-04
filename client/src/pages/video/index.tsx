import { useRef, useEffect, useState, FC } from "react";
import { API_URL } from "../../constants/api";
import Signaling from "../../utils/signaling";
import { authStore } from "../../store/authStore";

const Video: FC = () => {
  const selfViewRef = useRef(null) as any;
  const remoteViewRef = useRef(null) as any;
  const rtcConnectionRef = useRef(null) as any;
  const signalingRef = useRef(null) as any;
  const [ws, setWs] = useState<any>();
  const [connectedUsers, setConnectedUsers] = useState<
    { username: string; avatar: string; userId: string }[]
  >([]);

  const { userId, username, avatar } = authStore((state) => state);

  useEffect(() => {
    const ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}`);
    setWs(ws);
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "login", username, avatar, userId }));
    };

    if (ws) {
      ws.onmessage = (event: any) => {
        const messageData = JSON.parse(event.data);
        if (messageData.type === "connected_users") {
          setConnectedUsers(messageData.users);
          console.log("connected users", messageData.users);
        }
      };
    }
    return () => {
      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };
    };
  }, [ws, username, avatar]);

  useEffect(() => {
    // Setup local cam and signaling server
    ws.onopen = () => {
      console.log("Connected to the signaling server");
      setupConnection();
    };

    return () => {
      // Cleanup
      if (rtcConnectionRef.current) {
        rtcConnectionRef.current.close();
      }
    };
  }, [ws]);

  function setupConnection() {
    // Uncomment to use NodeJS sample
    signalingRef.current = new Signaling("ws://localhost:8080");

    // For own implementation use same API or comment out signaling methods and implement own API
    signalingRef.current.onMessage(onSignalingEvent);

    // Create new rtc connection
    rtcConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19305" }],
    });

    // Listen to rtc events
    rtcConnectionRef.current.onicecandidate = function (evt: any) {
      if (evt.candidate !== undefined)
        signalingRef.current.send(
          JSON.stringify({ type: "candidate", candidate: evt.candidate })
        );
    };

    rtcConnectionRef.current.ontrack = function (evt: any) {
      console.log("Track event:", evt);
      if (remoteViewRef.current && evt.streams.length > 0) {
        attachMediaStream(remoteViewRef.current, evt.streams[0]);
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        console.log("Stream received:", stream);
        // Attach local media stream to video element
        attachMediaStream(selfViewRef.current, stream);
        // Attach stream to the RTC connection
        rtcConnectionRef.current.addStream(stream);
      })
      .catch(function (err: any) {
        console.log(
          "##ERROR: There was an error getting the requested media#",
          err
        );
      });
  }

  async function onSignalingEvent(event: any) {
    try {
      // console.log("Signaling event:", event);
      // Parse data
      // event = JSON.parse(event);
      switch (event.type) {
        case "offer":
          await rtcConnectionRef.current.setRemoteDescription(event.offer);
          const answer = await rtcConnectionRef.current.createAnswer();
          await rtcConnectionRef.current.setLocalDescription(answer);
          signalingRef.current.send(
            JSON.stringify({
              type: "answer",
              answer,
              targetUserId: event.targetUserId,
            })
          );
          break;

        case "answer":
          // Received answer from the second device
          rtcConnectionRef.current.setRemoteDescription(event.answer);

          break;

        case "candidate":
          rtcConnectionRef.current?.addIceCandidate(
            new RTCIceCandidate(event.candidate)
          );
          break;
        case "sdp":
          // Gets description from caller and set it to RTC connection
          rtcConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription(event.sdp)
          );

          break;
        case "sdpRemote":
          // Get the description from the callee and set it to the RTC connection
          rtcConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(event.sdp)
          );
          break;
        case "connected_users":
          setConnectedUsers(event.users);
          console.log("Connected users:", event.users);
          break;
        case "onEvent":
          break;
        default:
          console.log("Unknown signaling event type:", event.type);
          break;
      }
    } catch (error) {
      console.error("Failed to parse signaling event:", error);
    }
  }

  // Attaches the stream to target video element
  function attachMediaStream(video: HTMLVideoElement, stream: any) {
    // video.srcObject = stream;
    // video.play();
    const videoTracks = stream.getVideoTracks();
    console.log(`Using video device: ${videoTracks[0].label}`);
    video.srcObject = stream;
  }

  return (
    <div>
      <h1>Video Call</h1>
      <div>
        <video
          ref={selfViewRef}
          autoPlay
          width="320"
          height="240"
          style={{ backgroundColor: "#000000" }}
        ></video>
        <video
          ref={remoteViewRef}
          autoPlay
          width="320"
          height="240"
          style={{ display: "none", backgroundColor: "#000000" }}
        ></video>
        <button
          onClick={() => {
            rtcConnectionRef.current.close();
            // setOpenVideoCall(false);
          }}
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default Video;
