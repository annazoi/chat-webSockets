import axios from "axios";
import { API_URL } from "../constants/api";
import { getAuthHeaders } from "../utils/headers";
import { Chat, NewChat } from "../validations-schemas/interfaces/chat";
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
    // if (response.data.length > 1) {
    //   const formattedData = response.data.map((chat: Chat) => formatChat(chat));
    //   return formattedData;
    // }
    // if (response.data.length === 1) {
    //   const formattedData = formatChat(response.data);
    //   return formattedData;
    // }
    return response.data;
  } catch (error) {
    throw error;
  }
};
