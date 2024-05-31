import axios from "axios";
import { API_URL } from "../constants/api";
import { formatUser } from "./formatter/user";
import { User } from "../validations-schemas/interfaces/user";

export const getUser = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    const formattedData = formatUser(response.data);
    return formattedData;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    const formattedData = response.data.map((user: User) => formatUser(user));
    return formattedData;
  } catch (error) {
    throw error;
  }
};
