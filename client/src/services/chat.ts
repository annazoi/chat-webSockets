import axios from "axios";
import { API_URL } from "../constants/api";
import { getAuthHeaders } from "../utils/headers";
import {
  Chat,
  NewChat,
  NewMessage,
} from "../validations-schemas/interfaces/chat";
import { formatChat } from "./formatter/chat";

export const createChat = async (data: NewChat) => {
  try {
    const response = await axios.post(
      `${API_URL}/chats`,
      { ...data },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/chats`, getAuthHeaders());
    const formattedData = response.data?.chats?.map((chat: Chat) =>
      formatChat(chat)
    );
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const getChat = async (id: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/chats/${id}`,
      getAuthHeaders()
    );
    const formattedData = formatChat(response.data);
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (chatId: string, payload: NewMessage) => {
  try {
    const response = await axios.post(
      `${API_URL}/chats/${chatId}/messages`,
      payload,
      getAuthHeaders()
    );
    console.log("API Response:", response.data.chat);
    const formattedData = formatChat(response.data.chat);
    return formattedData;
  } catch (error) {
    throw error;
  }
};
