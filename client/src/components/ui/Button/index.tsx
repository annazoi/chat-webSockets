import { FC } from "react";
import "./style.css";

interface ButtonProps {
  text?: string;
  icon?: any;
  buttonText?: string;
  onClick?: () => void;
  type?: any;
  style?: any;
}

const Button: FC<ButtonProps> = ({
  text,
  icon,
  buttonText,
  onClick,
  type,
  style,
}) => {
  return (
    <>
      {!icon && (
        <button type={type ? type : "button"} style={style}>
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
