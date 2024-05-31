import { FC } from "react";
import "./style.css";

interface ButtonProps {
  text?: string;
  icon?: any;
  buttonText?: string;
  onClick?: () => void;
  type?: any;
}

const Button: FC<ButtonProps> = ({ text, icon, buttonText, onClick, type }) => {
  return (
    <>
      {!icon && (
        <button
          type={type ? type : "button"}
          style={{
            borderRadius: "5px",
            width: "100%",
            backgroundColor: "#007bff",
            color: "white",
          }}
        >
          {text}
        </button>
      )}

      {icon && (
        <button className="Btn" onClick={onClick}>
          <div className="sign">
            <div className="icon">{icon}</div>
          </div>
          <div className="text">{buttonText}</div>
        </button>
      )}
    </>
  );
};

export default Button;
