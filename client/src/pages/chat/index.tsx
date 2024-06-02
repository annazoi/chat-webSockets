import { FC, useEffect, useState } from "react";
import "./style.css";
import { IoSend } from "react-icons/io5";
import Button from "../../components/ui/Button";
import { AiOutlineLogout } from "react-icons/ai";
import { useMutation, useQuery } from "react-query";
import { getUsers } from "../../services/user";
import { User } from "../../validations-schemas/interfaces/user";
import { IoIosSend } from "react-icons/io";
import { getChats, sendMessage } from "../../services/chat";
import { authStore } from "../../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
// import { useWebSocket } from "../../hooks/webSockets";
import {
  Chat as ChatProp,
  Message,
  NewMessage,
} from "../../validations-schemas/interfaces/chat";
import { API_URL } from "../../constants/api";
const Chat: FC = () => {
  const { id } = useParams();

  // const ws = useWebSocket();

  // const ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}`);

  const [hoverdId, setHoverdId] = useState<string>("");
  const [hovered, setHovered] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<any>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatProp[]>([]);
  const [ws, setWs] = useState<any>();

  const { logOut, userId } = authStore((state) => state);

  const { data: users } = useQuery("users", getUsers);
  const { data: chats } = useQuery<ChatProp[]>("chats", getChats);

  const { mutate: sendMessageMutate } = useMutation(
    ({ id, message }: { id: string; message: NewMessage }) =>
      sendMessage(id, message)
  );

  useEffect(() => {
    const ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}`);
    setWs(ws);
  }, []);

  const navigate = useNavigate();

  const handleHover = (id: string) => {
    setHoverdId(id);
  };

  const handleLogout = () => {
    logOut();
    navigate("/signin");
  };

  const handleSelectedChat = (chatId: string) => {
    const selectedChat: any = chats?.find((chat) => chat.id === chatId);
    setSelectedChat(selectedChat);
    setMessages(selectedChat?.messages || []);
    navigate(`/chat/${chatId}`);
    ws.send(JSON.stringify({ type: "join_room", room: chatId }));
  };

  const handleNewMessage = () => {
    if (newMessage === "") return;
    sendMessageMutate(
      {
        id: selectedChat?.id || "",
        message: {
          senderId: userId,
          message: newMessage,
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

          setNewMessage("");
          // refetch();
          setSelectedChat(data);
        },
      }
    );
  };

  useEffect(() => {
    if (!ws) return;
    ws.onopen = () => {
      console.log("WebSocket connected");
    };
    if (ws) {
      ws.onmessage = (event: any) => {
        const messageData = JSON.parse(event.data);
        if (messageData.type == "receive_message") {
          setMessages((prevMessage) => [...prevMessage, messageData.message]);
          setSelectedChat((prevChat: any) => {
            const chat = { ...prevChat };
            chat.messages = [...chat.messages, messageData.message];
            return chat;
          });
          console.log("receuvee", messageData);
        }
      };
    }
  }, [ws]);

  // useEffect(() => {
  //   console.log("MESSAGEs", messages);
  // }, [messages]);

  return (
    <div className="chat-container">
      <div className="chats-container">
        <div>Chats</div>
        {chats?.map((chat: ChatProp, index: number) => (
          <div
            key={index}
            style={{
              margin: "5px",
              textAlign: "left",
              padding: "5px",
              borderRadius: "15px",
              cursor: "pointer",
              backgroundColor:
                hoverdId == chat.id
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={() => handleHover(chat.id)}
            onMouseOut={() => setHoverdId("")}
            onClick={() => handleSelectedChat(chat.id)}
          >
            <div className="chat-name">{chat.name}</div>
            {/* <div className="chat-last-message">{chat.lastMessage}</div> */}
          </div>
        ))}
      </div>
      <div className="selected-chat-container">
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
                src={message.sender.avatar}
                alt=""
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginTop: "16px",
                }}
              />
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
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "10px",
            borderTop: "1px solid black",
            // boxSizing: "border-box",
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              width: "80%",
              padding: "5px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
            }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            icon={<IoSend />}
            buttonText="Send"
            onClick={handleNewMessage}
          ></Button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // justifyContent: "center",
          height: "90vh",
          minWidth: "10vw",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "0 15px 15px 0",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {users?.map((user: User, index: number) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                justifyContent: "center",
                width: "100%",
                boxSizing: "border-box",
                cursor: "pointer",
                borderRadius: index === 0 ? "0 15px 15px 15px" : "15px",
              }}
              onClick={() => console.log(`${user.username} clicked`)}
            >
              <div
                style={{
                  alignContent: "center",
                  paddingTop: "4px",
                }}
              >
                {user.avatar === "" ? (
                  <img
                    src="https://w7.pngwing.com/pngs/529/816/png-transparent-computer-icons-user-profile-avatar-heroes-monochrome-black.png"
                    alt=""
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <img
                    src={user.avatar}
                    alt=""
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>
              <div>
                <p>{user.username}</p>
              </div>
              <div
                style={{
                  cursor: "pointer",
                  paddingTop: "4px",
                  alignSelf: "center",
                }}
              >
                <IoIosSend />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            borderRadius: "0 0 15px 0",
            backgroundColor: hovered
              ? "rgba(0, 0, 0, 0.2)"
              : "rgba(0, 0, 0, 0.1)",
            justifyContent: "center",
            width: "100%",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          onClick={handleLogout}
        >
          <div>
            <p>logout</p>
          </div>
          <div
            style={{
              cursor: "pointer",
              paddingTop: "4px",
              alignSelf: "center",
            }}
          >
            <AiOutlineLogout />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Chat;
