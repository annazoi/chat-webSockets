import { FC } from "react";

interface InputProps {
  placeholder: string;
  register?: any;
}

const Input: FC<InputProps> = ({ placeholder, register, ...rest }) => {
  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          width: "100%",
          marginBottom: "10px",
          boxSizing: "border-box",
          backgroundColor: "transparent",
        }}
        {...register}
        {...rest}
      ></input>
    </div>
  );
};

export default Input;
