import { FC, useState } from "react";
import "./style.css";
import { IoSend } from "react-icons/io5";

const Chat: FC = () => {
  const [hoverdId, setHoverdId] = useState<string>("");

  const handleHover = (id: string) => {
    setHoverdId(id);
  };

  const chats = [
    {
      id: 1,
      name: "John Doe",
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
        {chats.map((chat: any) => (
          <div
            key={chat.id}
            style={{
              margin: "5px",
              textAlign: "left",
              padding: "5px",
              borderRadius: "15px",
              // backgroundColor: "rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              // onHover: "background-color: rgba(0, 0, 0, 0.2)",
              backgroundColor:
                hoverdId == chat.id.toString()
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={() => handleHover(chat.id)}
            onMouseOut={() => setHoverdId("")}
            onClick={() => console.log(`${chat.name} clicked`)}
          >
            <div className="chat-name">{chat.name}</div>
            <div className="chat-last-message">{chat.lastMessage}</div>
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
          <button
            style={{
              outline: "none",
            }}
          >
            Send
            {/* <IoSend color="black" size="20px" style={{ marginTop: "2px" }} /> */}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
