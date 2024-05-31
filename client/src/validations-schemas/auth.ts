import * as yup from "yup";

export const authSchema = yup.object().shape({
  username: yup.string().required("Invalid username"),
});
