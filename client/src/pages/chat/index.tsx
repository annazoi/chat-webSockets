import { FC, useEffect, useState } from "react";
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
  const [ws, setWs] = useState<any>();

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
    const ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}`);
    setWs(ws);
  }, []);

  useEffect(() => {
    if (chats && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

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
          ws.send(JSON.stringify({ type: "join_room", room: data.id }));
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

  const handleSelectedUserOptions = (id: string) => {
    if (userId !== id) {
      setSelectedUserId(id);
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
  }, [ws, username, avatar]);

  useEffect(() => {
    console.log("connected Users", connectedUsers);
  }, [connectedUsers]);

  useEffect(() => {
    console.log("public messages", publicMessages);
  }, [publicMessages]);

  return (
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
            <div className="public-chat" onClick={() => setIsPublicChat(true)}>
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
              {selectedChat?.messages.map((message: Message, index: number) => (
                <div
                  key={index}
                  className="message-container"
                  style={{
                    alignSelf:
                      message.sender.id === userId ? "flex-end" : "flex-start",
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
              ))}
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
                onClick={() => handleSelectedUserOptions(user.userId)}
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
                    <div>Make Video Call</div>
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
  );
};
export default Chat;
