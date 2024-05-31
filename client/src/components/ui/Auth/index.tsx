import { FC } from "react";
import "./style.css";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { authSchema } from "../../../validations-schemas/auth";
import { useForm } from "react-hook-form";
import { Signup, Signin } from "../../../validations-schemas/interfaces/user";
import { signup, signin } from "../../../services/auth";
import { useMutation } from "react-query";
import ImagePicker from "../../ImagePicker";
import { authStore } from "../../../store/authStore";

interface AuthProps {
  type?: string;
  icon?: any;
  buttonText?: string;
}

const Auth: FC<AuthProps> = ({ type, icon, buttonText }) => {
  const { logIn } = authStore((state) => state);
  const navigate = useNavigate();
  const { mutate: signupMutate } = useMutation(signup);
  const { mutate: signinMutate } = useMutation(signin);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Signup | Signin>({
    defaultValues: {
      username: "",
      avatar: "",
    },
    resolver: yupResolver(authSchema),
  });

  const handleImage = (avatar: string) => {
    setValue("avatar", avatar);
  };

  const onSubmit = async (data: any) => {
    try {
      if (type === "Sign Up") {
        signupMutate(data, {
          onSuccess: (data: any) => {
            if (data.avatar === undefined || data.avatar === " ") {
              data.avatar = "";
            }
            logIn({
              token: data.token,
              userId: data.userId,
              avatar: data.avatar,
              username: data.username,
            });
            navigate("/chat");
          },
        });
      } else {
        signinMutate(data, {
          onSuccess: (data: any) => {
            logIn({
              token: data.token,
              userId: data.userId,
              avatar: data.avatar,
              username: data.username,
            });
            navigate("/chat");
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="auth-container">
        <p
          style={{
            letterSpacing: "2px",
          }}
        >
          {type}
        </p>
        <form
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input placeholder="Username" register={register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
          {type === "Sign Up" && (
            <ImagePicker onChange={handleImage}></ImagePicker>
          )}
          <Button
            text={type}
            type="submit"
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              marginTop: "15px",
            }}
          />
        </form>
      </div>
      <div
        style={{
          margin: "0 auto",
          justifyContent: "center",
          display: "flex",
          paddingTop: "20px",
        }}
      >
        <Button
          icon={icon}
          buttonText={buttonText}
          onClick={() =>
            navigate(buttonText === "Login" ? "/signin" : "/signup")
          }
        />
      </div>
    </>
  );
};

export default Auth;
