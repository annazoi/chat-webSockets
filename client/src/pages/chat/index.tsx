import { FC, useState } from "react";
import "./style.css";
import { IoSend } from "react-icons/io5";
import Button from "../../components/ui/Button";
import { AiOutlineLogout } from "react-icons/ai";
import { useQuery } from "react-query";
import { getUsers } from "../../services/user";
import { User } from "../../validations-schemas/interfaces/user";
import { IoIosSend } from "react-icons/io";
import { getChats } from "../../services/chat";
import { authStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Chat as ChatProps } from "../../validations-schemas/interfaces/chat";
const Chat: FC = () => {
  const [hoverdId, setHoverdId] = useState<string>("");
  const [hovered, setHovered] = useState<boolean>(false);

  const { logOut } = authStore((state) => state);

  const { data: users } = useQuery("users", getUsers);
  const { data: chats } = useQuery("chats", getChats);

  const navigate = useNavigate();

  const handleHover = (id: string) => {
    setHoverdId(id);
  };

  const handleLogout = () => {
    logOut();
    navigate("/signin");
  };

  const chatss = [
    {
      id: 1,
      name: "Public Chat",
      lastMessage: "Hello",
      lastMessageTime: "12:00",
      unreadMessages: 3,
    },
    {
      id: 2,
      name: "Jane Doe",
      lastMessage: "Hi",
      lastMessageTime: "12:01",
      unreadMessages: 0,
    },
    {
      id: 3,
      name: "John Smith",
      lastMessage: "Hey",
      lastMessageTime: "12:02",
      unreadMessages: 1,
    },
    {
      id: 4,
      name: "Jane Smith",
      lastMessage: "Hi",
      lastMessageTime: "12:03",
      unreadMessages: 0,
    },
    {
      id: 5,
      name: "John Doe",
      lastMessage: "Hello",
      lastMessageTime: "12:00",
      unreadMessages: 3,
    },
  ];

  const messages = [
    {
      id: 1,
      message: "Hello",
      senderId: 1,
    },
    {
      id: 2,
      message: "Hi",
      senderId: 2,
    },
    {
      id: 3,
      message: "Hey",
      senderId: 1,
    },
    {
      id: 4,
      message: "Hi",
      senderId: 2,
    },
  ];

  return (
    <div className="chat-container">
      <div className="chats-container">
        <div>Chats</div>
        {chatss?.map((chat: any, index: number) => (
          <div
            key={index}
            style={{
              margin: "5px",
              textAlign: "left",
              padding: "5px",
              borderRadius: "15px",
              cursor: "pointer",
              backgroundColor:
                hoverdId == chat.id.toString()
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={() => handleHover(chat._id)}
            onMouseOut={() => setHoverdId("")}
            onClick={() => console.log(`${chat.name} clicked`)}
          >
            <div className="chat-name">{chat.name}</div>
            {/* <div className="chat-last-message">{chat.lastMessage}</div> */}
          </div>
        ))}
      </div>
      <div className="selected-chat-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflowY: "auto",
            minHeight: "84vh",
            // alignItems: {messages.senderId === 1 ? "flex-end" : "flex-start"},
            justifyContent: "flex-end",
          }}
        >
          {messages.map((message: any) => (
            <div key={message.id} className="message-container">
              {message.message}
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
          />
          <Button icon={<IoSend />} buttonText="Send"></Button>
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
