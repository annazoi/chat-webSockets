import { Chat, Message } from "../../validations-schemas/interfaces/chat";
import { formatUser } from "./user";

export const formatChat = (data: any): Chat => {
  return {
    id: data._id,
    name: data.name,
    type: data.type,
    messages: data.messages.map((message: any) => formatMessage(message)),
    members: data.members.map((member: any) => formatUser(member)),
  };
};

export const formatMessage = (data: any): Message => {
  return {
    id: data._id,
    message: data.message,
    senderId: data.senderId,
    createdAt: data.createdAt,
    image: data.image,
  };
};
