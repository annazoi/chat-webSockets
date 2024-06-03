import { IoSend } from "react-icons/io5";
import Button from "../ui/Button";
import "./style.css";
import { FC, useEffect } from "react";
import { GoArrowLeft } from "react-icons/go";

interface PublicChatProps {
  setIsPublicChat: (value: boolean) => void;
  messages: any;
  handleNewMessage: () => void;
  newMessage: string;
  setNewMessage: (value: string) => void;
  userId: string;
  avatar: string;
}

const PublicChat: FC<PublicChatProps> = ({
  setIsPublicChat,
  messages,
  handleNewMessage,
  newMessage,
  setNewMessage,
  userId,
  avatar,
}) => {
  useEffect(() => {
    console.log(messages);
  }, [messages]);
  return (
    <>
      <div className="exit-public-chat" onClick={() => setIsPublicChat(false)}>
        <div>Go to private Chats</div>
        <GoArrowLeft />
      </div>
      <div className="selected-chat-container">
        <div>Public Chat</div>
        <div className="message-list">
          {messages?.map((message: any, index: number) => (
            <div
              key={index}
              className="message-container"
              style={{
                alignSelf:
                  message.userId === userId ? "flex-end" : "flex-start",
                flexDirection:
                  message.userId === userId ? "row-reverse" : "row",
              }}
            >
              <img
                src={
                  message.avatar === ""
                    ? "https://w7.pngwing.com/pngs/529/816/png-transparent-computer-icons-user-profile-avatar-heroes-monochrome-black.png"
                    : message.avatar
                }
                alt=""
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginTop: "16px",
                }}
              />

              <div
                className="public-message-content"
                style={{
                  backgroundColor:
                    message.userId === userId
                      ? "rgb(240, 248, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <strong>{message.username}: </strong>
                </div>
                <div>{message.message}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="message-input-container">
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
          <Button
            icon={<IoSend />}
            buttonText="Send"
            onClick={handleNewMessage}
          ></Button>
        </div>
      </div>
    </>
  );
};

export default PublicChat;
