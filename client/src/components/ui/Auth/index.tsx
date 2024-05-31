import { FC } from "react";
import "./style.css";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { authSchema } from "../../../validations-schemas/auth";
import { useForm } from "react-hook-form";
import { Auth as AuthConfig } from "../../../validations-schemas/interfaces/user";
import { signup, signin } from "../../../services/auth";
import { useMutation } from "react-query";

interface AuthProps {
  text?: string;
  icon?: any;
  buttonText?: string;
}

const Auth: FC<AuthProps> = ({ text, icon, buttonText }) => {
  const navigate = useNavigate();
  const { mutate: signupMutate } = useMutation(signup);
  const { mutate: signinMutate } = useMutation(signin);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthConfig>({
    defaultValues: {
      username: "",
    },
    resolver: yupResolver(authSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      if (text === "Sign Up") {
        signupMutate(data, {
          onSuccess: () => {
            console.log("signup", data);
            navigate("/chat");
          },
        });
      } else {
        signinMutate(data, {
          onSuccess: () => {
            console.log("signin", data);
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
          {text}
        </p>
        <form
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input placeholder="Username" register={register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
          <Button text={text} type="submit" />
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
