import { Chat, Message } from "../../validations-schemas/interfaces/chat";
import { formatUser } from "./user";

export const formatChat = (data: any): Chat => {
  return {
    id: data._id,
    name: data.name,
    type: data.type,
    creatorId: formatUser(data.creatorId),
    members: data.members.map((member: any) => formatUser(member)),
    messages: data.messages.map((message: any) => ({
      createdAt: message.createdAt,
      image: message.image,
      message: message.message,
      sender: formatUser(message.senderId),
      id: message._id,
    })),
  };
};
