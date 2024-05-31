import { Auth } from "../validations-schemas/interfaces/user";
import axios from "axios";
import { API_URL } from "../constants/api";

export const signup = async (data: Auth) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signin = async (data: Auth) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
