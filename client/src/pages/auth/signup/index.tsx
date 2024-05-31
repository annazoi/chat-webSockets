import { FC } from "react";

import { AiOutlineLogin } from "react-icons/ai";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { authSchema } from "../../../validations-schemas/auth";
import Auth from "../../../components/ui/Auth";
import { Auth as AuthConfig } from "../../../validations-schemas/interfaces/user";

const Signup: FC = () => {
  // const {
  //   register,
  //   handleSubmit,
  //   setValue,
  //   formState: { errors },
  // } = useForm<AuthConfig>({
  //   defaultValues: {
  //     username: "",
  //   },
  //   resolver: yupResolver(authSchema),
  // });
  return (
    <>
      <Auth
        text="Sign Up"
        icon={<AiOutlineLogin size={17} color="white" />}
        buttonText="Login"
      ></Auth>
    </>
  );
};

export default Signup;
