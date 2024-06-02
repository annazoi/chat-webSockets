import { User } from "./user";

export interface NewChat {
  name: string;
  type: string;
  members: string[];
}

export interface NewMessage {
  message: string;
  senderId: string;
}

export interface Chat {
  id: string;
  name: string;
  type: string;
  creatorId: User;
  members: string[];
  messages: Message[];
}

export interface Message {
  id: string;
  message: string;
  sender: User;
  createdAt: string;
  image?: string;
}
