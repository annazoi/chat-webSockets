import { User } from "../../validations-schemas/interfaces/user";

export const formatUser = (data: any): User => {
  return {
    id: data._id,
    username: data.username,
    avatar: data.avatar,
  };
};
