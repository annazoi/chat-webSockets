import { FC } from "react";
import { FaPhoneAlt } from "react-icons/fa";

interface VideoProps {
  isCallOpen: boolean;
  stream: any;
  myVideo: any;
  userVideo: any;
  callAccepted: boolean;
  callEnded: boolean;
  selectedSocket: string;
  receivingCall: boolean;
  selectedNameCaller: string;
  me: string;
  callUser: (id: string) => void;
  leaveCall: () => void;
  answerCall: () => void;
  setIsCallOpen: (isCallOpen: boolean) => void;
}

const Video: FC<VideoProps> = ({
  isCallOpen,
  stream,
  myVideo,
  userVideo,
  callAccepted,
  callEnded,
  selectedSocket,
  receivingCall,
  selectedNameCaller,
  callUser,
  leaveCall,
  answerCall,
  setIsCallOpen,
  me,
}) => {
  return (
    <>
      {isCallOpen && (
        <>
          <div className="video-call-container">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
                backgroundColor: "#ffa2e973",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "10px",
                  }}
                >
                  <button onClick={() => setIsCallOpen(false)}>X</button>
                </div>
                {stream && (
                  <video
                    playsInline
                    muted
                    ref={myVideo}
                    autoPlay
                    style={{
                      width: "320px",
                      height: "240px",
                      backgroundColor: "#000000",
                      borderRadius: "10px",
                    }}
                  ></video>
                )}
              </div>
              <div>
                {callAccepted && !callEnded ? (
                  <video
                    playsInline
                    ref={userVideo}
                    autoPlay
                    style={{
                      width: "320px",
                      height: "240px",
                      backgroundColor: "#000000",
                      borderRadius: "10px",
                    }}
                  />
                ) : null}
              </div>
              {callAccepted && !callEnded ? (
                <button onClick={leaveCall}>End Call</button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      callUser(selectedSocket);
                    }}
                  >
                    <FaPhoneAlt />
                  </button>
                </>
              )}
              {/* <div>{me}</div> */}
              <div>
                {receivingCall && !callAccepted ? (
                  <div className="caller">
                    <h1>{selectedNameCaller} is calling...</h1>
                    <button onClick={answerCall}>Answer</button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Video;
