import { FC, useEffect, useRef, useState } from "react";
import "./style.css";
import { IoSend, IoVideocam } from "react-icons/io5";
import Button from "../../components/ui/Button";
import { AiOutlineLogout } from "react-icons/ai";
import { RiRadioButtonLine } from "react-icons/ri";
import { useMutation, useQuery } from "react-query";
import { User } from "../../validations-schemas/interfaces/user";
import { Socket } from "../../validations-schemas/interfaces/video";
import { IoIosSend } from "react-icons/io";
import { createChat, getChats, sendMessage } from "../../services/chat";
import { authStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";

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
import { useParams } from "react-router";
import { BsThreeDots } from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";
const Chat: FC = () => {
  const [selectedChat, setSelectedChat] = useState<any>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [connectedUsers, setConnectedUsers] = useState<any>([]);
  const [connectedSockets, setConnectedSockets] = useState<any>([]);
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [publicInput, setPublicInput] = useState<string>("");
  const [isPublicChat, setIsPublicChat] = useState<boolean>(false);
  const [isConnectedUserOptions, setIsConnectedUserOptions] =
    useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isImageMessage, setIsImageMessage] = useState<boolean>(false);
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [me, setMe] = useState<string>("");
  const [stream, setStream] = useState<any>();
  const [receivingCall, setReceivingCall] = useState<boolean>(false);
  const [caller, setCaller] = useState<any>();
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [isOpenImage, setIsOpenImage] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<any>();
  const [idToCall, setIdToCall] = useState<string>("");
  const [socket, setSocket] = useState<any>();
  const [selectedSocket, setSelectedSocket] = useState<string>("");
  const [selectedNameCaller, setSelectedNameCaller] = useState<string>("");

  const myVideo = useRef<any>(null);
  const userVideo = useRef<any>(null);
  const connectionRef = useRef<any>(null);

  const { id } = useParams();

  const { logOut, userId, username, avatar } = authStore((state) => state);

  const { data: chats, refetch } = useQuery<ChatProp[]>("chats", getChats);

  const { mutate: createChatMutate } = useMutation(
    ({ type, members }: { type: string; members: any[] }) =>
      createChat({ type, members })
  );

  const { mutate: sendMessageMutate, isLoading: isSendMessageloading } =
    useMutation(({ id, message }: { id: string; message: NewMessage }) =>
      sendMessage(id, message)
    );

  const navigate = useNavigate();

  useEffect(() => {
    const s = io(`${API_URL}`);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("connected to Socket server");
      });
    }
  }, [socket]);

  useEffect(() => {
    socket?.emit("join_room", id);
  }, [socket]);

  useEffect(() => {
    socket?.emit("login", { username, avatar, userId });
    if (socket) {
      socket?.on("connected_users", (users: any) => {
        setConnectedUsers(users);
        // console.log("connected users", users);
      });
      socket?.on("connected_sockets", (sockets: any) => {
        setConnectedSockets(sockets);
        console.log("connected sockets", sockets);
      });
    }
  }, [username, userId, socket, avatar]);

  useEffect(() => {
    if (socket) {
      socket?.on("receive_message", (message: any) => {
        delete message.userChat;
        console.log("receive_message", message);
        setSelectedChat((prevChat: any) => {
          const chat = { ...prevChat };
          chat.messages = [...chat.messages, message];
          return chat;
        });
        // console.log("setSelectedChat", selectedChat);
      });
    }
  }, [socket]);

  useEffect(() => {
    try {
      if (socket) {
        socket?.on("receive_public_chat", (message: any) => {
          console.log("receive_public_chat", message);
          setPublicMessages((prevMessages) => [...prevMessages, message]);
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [socket]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket?.on("me", (id: string) => {
      setMe(id);
    });
    socket?.on("callUser", (data: any) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
      console.log("callUser", data);
    });
  }, [socket, isCallOpen]);

  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then((myStream: MediaStream) => {
  //       setStream(myStream);
  //       if (myVideo.current) {
  //         myVideo.current.srcObject = myStream;
  //       }
  //       console.log("stream", myStream);
  //     });
  // }, [isCallOpen]);

  useEffect(() => {
    if (chats && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

  // useEffect(() => {
  //   console.log("public messages", publicMessages);
  // }, [publicMessages]);

  useEffect(() => {
    // console.log("connected users", connectedUsers);
    connectedUsers.map((user: any) => console.log("socketId", user.socketId));
  }, [connectedUsers]);

  const callUser = (id: string) => {
    console.log("callUser", id);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer?.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer?.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal: any) => {
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
      socket.emit("answerCall", { signal: data, to: caller });
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
      avatar: avatar,
    };
    setPublicMessages((prevMessages) => [...prevMessages, messagesData]);
    socket?.emit("public_chat", messagesData);
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
  };

  const handleNewMessage = () => {
    isSendMessageloading;
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
            userChat: id,
          };
          socket?.emit("send_message", messageData);
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

  useEffect(() => {
    console.log("selectedSocket", selectedSocket);
  }, [selectedSocket]);

  return (
    <>
      <div className="chat-container">
        {isPublicChat ? (
          <PublicChat
            socket={socket}
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
              <div className="chat-bar">
                <div className="heading-text" style={{ marginTop: "6px" }}>
                  {handleChatName(selectedChat)}
                </div>

                <div>
                  <Button
                    buttonText="Video"
                    icon={<IoVideocam />}
                    onClick={() => {
                      setIsCallOpen(true);
                      const id = selectedChat.members.find(
                        (member: User) => member.id !== userId
                      ).id;
                      const socket = connectedSockets.find(
                        (socket: Socket) => socket.userId === id
                      );

                      // console.log("socketId", socket.socketId);
                      // console.log("name", socket.username);

                      setSelectedSocket(socket.socketId);
                      setSelectedNameCaller(socket.username);
                      // callUser(socketId);
                    }}
                  ></Button>
                </div>
              </div>
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
                          onClick={() => {
                            setIsOpenImage(!isOpenImage);
                            setSelectedImage(message.image);
                          }}
                          src={message.image}
                          alt=""
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "10px",
                          }}
                        />
                      )}

                      {isOpenImage && (
                        <div className="image-message-preview">
                          <div className="image-message-close ">
                            <button
                              onClick={() => setIsOpenImage(!isOpenImage)}
                            >
                              Close
                            </button>
                          </div>
                          <div>
                            <img
                              onClick={() => setIsOpenImage(!isOpenImage)}
                              src={selectedImage}
                              alt=""
                              style={{
                                width: "600px",
                                height: "600px",
                              }}
                            />
                          </div>
                        </div>
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
                    icon={isSendMessageloading ? <BsThreeDots /> : <IoSend />}
                    buttonText={isSendMessageloading ? "Sending..." : "Send"}
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
          <>
            <div>
              <div className="video-call-container">
                <div>
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
                    <button onClick={() => setIsCallOpen(false)}>Close</button>
                  </>
                )}
                {/* {idToCall} */}
                <div>{me}</div>
                <div>{userId}</div>
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
    </>
  );
};
export default Chat;
