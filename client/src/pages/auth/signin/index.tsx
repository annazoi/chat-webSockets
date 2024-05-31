import { FC } from "react";
import { AiOutlineLogin } from "react-icons/ai";
import Auth from "../../../components/ui/Auth";

const Signin: FC = () => {
  return (
    <>
      <Auth
        type="Sign In"
        icon={<AiOutlineLogin size={17} color="white" />}
        buttonText="Register"
      ></Auth>
    </>
  );
};

export default Signin;
