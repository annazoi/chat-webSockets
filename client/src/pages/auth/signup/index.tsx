import { FC } from "react";
import { AiOutlineLogin } from "react-icons/ai";
import Auth from "../../../components/ui/Auth";

const Signup: FC = () => {
  return (
    <>
      <Auth
        type="Sign Up"
        icon={<AiOutlineLogin size={17} color="white" />}
        buttonText="Login"
      ></Auth>
    </>
  );
};

export default Signup;
