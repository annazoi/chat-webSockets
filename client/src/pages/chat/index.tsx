import { FC, useEffect, useRef, useState } from "react";
import "./style.css";
import { IoSend, IoVideocam } from "react-icons/io5";
import Button from "../../components/ui/Button";
import { AiOutlineLogout } from "react-icons/ai";
import { RiRadioButtonLine } from "react-icons/ri";
import { useMutation, useQuery } from "react-query";
// import { getUsers } from "../../services/user";
import { User } from "../../validations-schemas/interfaces/user";
import { IoIosSend } from "react-icons/io";
import { createChat, getChats, sendMessage } from "../../services/chat";
import { authStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import Signaling from "../../utils/signaling";

import {
  Chat as ChatProp,
  Message,
  NewMessage,
} from "../../validations-schemas/interfaces/chat";
import { API_URL } from "../../constants/api";
import PublicChat from "../../components/PublicChat";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { GrGallery } from "react-icons/gr";

const Chat: FC = () => {
  const [selectedChat, setSelectedChat] = useState<any>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [connectedUsers, setConnectedUsers] = useState<
    { username: string; avatar: string; userId: string }[]
  >([]);
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [publicInput, setPublicInput] = useState<string>("");
  const [isPublicChat, setIsPublicChat] = useState<boolean>(false);
  const [isConnectedUserOptions, setIsConnectedUserOptions] =
    useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isImageMessage, setIsImageMessage] = useState<boolean>(false);
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);

  // webSockets
  const [ws, setWs] = useState<any>();

  // WebRTC video calling
  const selfViewRef = useRef(null) as any;
  const remoteViewRef = useRef(null) as any;
  const rtcConnectionRef = useRef(null) as any;
  const signalingRef = useRef(null) as any;

  const { logOut, userId, username, avatar } = authStore((state) => state);

  // const { data: users } = useQuery("users", getUsers);
  const { data: chats, refetch } = useQuery<ChatProp[]>("chats", getChats);

  const { mutate: createChatMutate } = useMutation(
    ({ type, members }: { type: string; members: any[] }) =>
      createChat({ type, members })
  );

  const { mutate: sendMessageMutate } = useMutation(
    ({ id, message }: { id: string; message: NewMessage }) =>
      sendMessage(id, message)
  );

  const navigate = useNavigate();

  useEffect(() => {
    // Setup local cam and signaling server
    // setupConnection();

    return () => {
      // Cleanup
      if (rtcConnectionRef.current) {
        rtcConnectionRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chats && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

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
        if (messageData.type == "receive_message") {
          setSelectedChat((prevChat: any) => {
            const chat = { ...prevChat };
            chat.messages = [...chat.messages, messageData.message];
            return chat;
          });
          console.log("receive message", messageData);
        } else if (messageData.type === "connected_users") {
          setConnectedUsers(messageData.users);
          console.log("connected users", messageData.users);
        } else if (messageData.type === "public_chat") {
          setPublicMessages((prevMessages) => [
            ...prevMessages,
            messageData.message,
          ]);
          console.log("public chat", messageData);
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
    console.log("connected Users", connectedUsers);
  }, [connectedUsers]);

  useEffect(() => {
    console.log("public messages", publicMessages);
  }, [publicMessages]);

  // WebRTC video calling
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

    rtcConnectionRef.current.oniceconnectionstatechange = function (evt: any) {
      console.log("ICE connection state change:", evt);
    };

    rtcConnectionRef.current.onicegatheringstatechange = function (evt: any) {
      console.log("ICE gathering state change:", evt);
    };

    rtcConnectionRef.current.onaddstream = function (evt: any) {
      remoteViewRef.current.setAttribute("style", null);
      // // Attach incoming stream to remote view
      attachMediaStream(remoteViewRef.current, evt.stream);
    };

    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then(function (stream) {
    //     console.log("Stream received:", stream);
    //     // Attach local media stream to video element
    //     attachMediaStream(selfViewRef.current, stream);
    //     // Attach stream to the RTC connection
    //     rtcConnectionRef.current.addStream(stream);
    //   })
    //   .catch(function (err: any) {
    //     console.log(
    //       "##ERROR: There was an error getting the requested media#",
    //       err
    //     );
    //   });
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        console.log("Stream received:", stream);
        // Attach local media stream to video element
        attachMediaStream(selfViewRef.current, stream);
        // Attach stream to the RTC connection
        stream.getTracks().forEach((track) => {
          rtcConnectionRef.current.addTrack(track, stream);
        });
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

          rtcConnectionRef.current?.createAnswer(function (desc: any) {
            rtcConnectionRef.current?.setLocalDescription(desc);
            signalingRef.current.send(
              JSON.stringify({
                type: "sdp",
                sdp: desc,
              })
            );
          });
          break;
        case "sdpRemote":
          // Get the description from the caller and set it to the RTC connection
          rtcConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(event.sdp)
          );
          break;
        case "connected_users":
          setConnectedUsers(event.users);
          console.log("Connected users:", event.users);
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
    const videoTracks = stream.getVideoTracks();
    console.log(`Using video device: ${videoTracks[0].label}`);
    video.srcObject = stream;
  }

  const handleVideoCall = async (user: any) => {
    setupConnection();
    setIsCallOpen(true);
    try {
      rtcConnectionRef.current.createOffer(function (desc: any) {
        rtcConnectionRef.current.setLocalDescription(desc);
        signalingRef.current.send(
          JSON.stringify({
            type: "sdp",
            sdp: desc,
            targetUserId: user.userId, // Send the target user's ID
          })
        );
        console.log("user", user);
      });
    } catch (error) {
      console.error("##ERROR:There was an error with the description#", error);
    }
  };

  const createPrivateChat = (memberId: string) => {
    const members = [userId, memberId];
    createChatMutate(
      {
        type: "private",
        members,
      },
      {
        onSuccess: (data) => {
          setSelectedChat(data.chat);
          // console.log("data", data.chat);
          refetch().then(() => {
            navigate(`/chat/${data.chat._id}`);
          });
        },
      }
    );
  };

  const handlePublicMessage = () => {
    const messagesData = {
      message: publicInput,
      username: username,
      userId: userId,
      // avatar: avatar,
    };
    ws.send(JSON.stringify({ type: "public_chat", message: messagesData }));
    setPublicInput("");
  };

  const handleChatName = (chat: any) => {
    // console.log("chat", chat);
    const member = chat?.members.find((member: User) => member.id !== userId);
    return member?.username;
  };

  const handleChatAvatar = (chat: any) => {
    const member = chat.members.find((member: User) => member.id !== userId);
    if (!member.avatar) {
      return "https://w7.pngwing.com/pngs/529/816/png-transparent-computer-icons-user-profile-avatar-heroes-monochrome-black.png";
    } else {
      return member.avatar;
    }
  };

  const handleLogout = () => {
    logOut();
    navigate("/signin");
  };

  const handleSelectedChat = (chatId: string) => {
    const selectedChat: any = chats?.find((chat) => chat.id === chatId);
    setSelectedChat(selectedChat);
    navigate(`/chat/${chatId}`);
    ws.send(JSON.stringify({ type: "join_room", room: chatId }));
  };

  const handleNewMessage = () => {
    if (newMessage === "" && !image) return;
    sendMessageMutate(
      {
        id: selectedChat?.id || "",
        message: {
          senderId: userId,
          message: newMessage,
          image: image,
        },
      },
      {
        onSuccess: (data) => {
          const messageData = {
            ...data.messages[data.messages.length - 1],
          };
          ws.send(
            JSON.stringify({ type: "send_message", message: messageData })
          );
          refetch();
          setNewMessage("");
          setImage("");
          setIsImageMessage(false);
          setSelectedChat(data);
        },
      }
    );
  };

  const handleSelectedUserOptions = (user: any) => {
    if (userId !== user.userId) {
      setSelectedUserId(user.userId);
      setIsConnectedUserOptions(!isConnectedUserOptions);
    }
  };

  const handleGallery = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    let imageUrl = image.dataUrl;

    setImage(imageUrl || "");
    setIsImageMessage(true);
    return imageUrl;
  };

  return (
    <>
      <div className="chat-container">
        {isPublicChat ? (
          <PublicChat
            setIsPublicChat={() => setIsPublicChat(!isPublicChat)}
            messages={publicMessages}
            handleNewMessage={handlePublicMessage}
            newMessage={publicInput}
            setNewMessage={setPublicInput}
            userId={userId}
            avatar={avatar}
          />
        ) : (
          <>
            <div className="chats-container">
              <div className="heading-text">{username}'s Inbox</div>
              <div
                className="public-chat"
                onClick={() => setIsPublicChat(true)}
              >
                <div>Go to Public Chat</div>
                <FaArrowRightToBracket
                  className="boxes-content"
                  style={{
                    marginBottom: "4px",
                  }}
                />
              </div>
              {chats?.map((chat: ChatProp, index: number) => (
                <div
                  key={index}
                  className="chats-content"
                  onClick={() => handleSelectedChat(chat.id)}
                >
                  <div className="chats-info">
                    <img
                      src={handleChatAvatar(chat)}
                      alt=""
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {" "}
                        {handleChatName(chat)}
                      </div>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "300px",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {chat.messages[chat.messages.length - 1]?.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="selected-chat-container">
              <div className="heading-text">{handleChatName(selectedChat)}</div>
              {!selectedChat && (
                <div
                  style={{
                    marginTop: "20px",
                    textAlign: "center",
                    letterSpacing: "2px",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.2)",
                  }}
                >
                  <p>
                    You have no messages yet. Click on a user to start a chat.
                  </p>
                </div>
              )}
              <div className="message-list">
                {selectedChat?.messages.map(
                  (message: Message, index: number) => (
                    <div
                      key={index}
                      className="message-container"
                      style={{
                        alignSelf:
                          message.sender.id === userId
                            ? "flex-end"
                            : "flex-start",
                        flexDirection:
                          message.sender.id === userId ? "row-reverse" : "row",
                      }}
                    >
                      <img
                        src={
                          message.sender.avatar === ""
                            ? "https://w7.pngwing.com/pngs/529/816/png-transparent-computer-icons-user-profile-avatar-heroes-monochrome-black.png"
                            : message.sender.avatar
                        }
                        alt=""
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          marginTop: "16px",
                        }}
                      />
                      {message.message && (
                        <div
                          className="message-content"
                          style={{
                            backgroundColor:
                              message.sender.id === userId
                                ? "rgb(240, 248, 255, 0.6)"
                                : "rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {message.message}
                        </div>
                      )}
                      {message.image && (
                        <img
                          src={message.image}
                          alt=""
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "10px",
                          }}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
              {selectedChat && (
                <div className="message-input-container">
                  {!isImageMessage ? (
                    <input
                      className="message-input-content"
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleNewMessage();
                      }}
                    />
                  ) : (
                    <div className="image-input-content">
                      <img
                        src={image}
                        alt=""
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  )}

                  <Button
                    icon={<GrGallery />}
                    buttonText="Image"
                    onClick={handleGallery}
                  ></Button>
                  <Button
                    icon={<IoSend />}
                    buttonText="Send"
                    onClick={handleNewMessage}
                  ></Button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="online-users-container">
          <div className="online-users-content">
            {connectedUsers.map((user: any, index: number) => (
              <div key={index}>
                <div
                  className="online-users-box"
                  style={{
                    borderRadius: index === 0 ? "0 15px 15px 15px" : "15px",
                  }}
                  onClick={() => handleSelectedUserOptions(user)}
                >
                  <div className="boxes-content">
                    <RiRadioButtonLine color="green" />
                  </div>
                  <div
                    style={{
                      alignContent: "center",
                      paddingTop: "4px",
                    }}
                  >
                    <img
                      src={
                        user.avatar === ""
                          ? "https://w7.pngwing.com/pngs/529/816/png-transparent-computer-icons-user-profile-avatar-heroes-monochrome-black.png"
                          : user.avatar
                      }
                      alt=""
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <div>
                    <p>{user.username}</p>
                  </div>
                </div>
                {isConnectedUserOptions && selectedUserId === user.userId && (
                  <div className="connected-user-options-container">
                    <div
                      className="connected-user-options-content"
                      onClick={() => createPrivateChat(user.userId)}
                    >
                      <div>Send Message</div>
                      <IoIosSend className="boxes-content" />
                    </div>
                    <div
                      className="connected-user-options-content"
                      style={{ borderTop: "1px solid rgb(0,0,0,0.1)" }}
                    >
                      <div
                        onClick={() => handleVideoCall(user)}
                        style={{ color: "red" }}
                      >
                        Make Video Call
                      </div>
                      <IoVideocam className="boxes-content" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="logout-button" onClick={handleLogout}>
            <div>
              <p>logout</p>
            </div>
            <div className="boxes-content">
              <AiOutlineLogout />
            </div>
          </div>
        </div>
      </div>
      <>
        {isCallOpen && (
          <div className="video-call-container">
            <video
              ref={selfViewRef}
              autoPlay
              width="320"
              height="240"
              style={{ backgroundColor: "#000000", borderRadius: "10px" }}
            ></video>
            <video
              ref={remoteViewRef}
              autoPlay
              width="320"
              height="240"
              style={{ backgroundColor: "#000000", borderRadius: "10px" }}
            ></video>
            <button
              onClick={() => {
                rtcConnectionRef.current.close();
                setIsCallOpen(false);
              }}
            >
              End Call
            </button>
          </div>
        )}
      </>
    </>
  );
};
export default Chat;
