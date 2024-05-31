export interface NewChat {
  name: string;
  type: string;
  members: string[];
}

export interface Chat {
  id: string;
  name: string;
  type: string;
  messages: Message[];
  members: string[];
}

export interface Message {
  id: string;
  message: string;
  senderId: string;
  createdAt: string;
  image?: string;
}
