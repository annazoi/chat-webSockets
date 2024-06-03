import { useRef, useState, useEffect } from "react";
import "./style.css";

interface ImagePickerProps {
  name?: string;
  onChange: (event: any) => void;
  value?: any;
  text?: any;
  register?: any;
}

const ImagePicker = ({
  name,
  onChange,
  value,
  text,
}: // register,
ImagePickerProps) => {
  const imageRef: any = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    setImage(value);
  }, [value]);

  const handleImageClick = () => {
    imageRef.current.click();
  };

  const handleImage = (event: any) => {
    const file = event.target.files[0];
    makeBase64(file).then((base64: any) => {
      setImage(base64);
      onChange(base64);
    });
  };

  const makeBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div>
      <input
        type="file"
        className="image-input"
        name={name}
        onChange={handleImage}
        accept="image/x-png,image/gif,image/jpeg, image/jpg, image/png"
        ref={imageRef}
      />
      {image && (
        <img
          onClick={handleImageClick}
          className="image-preview"
          src={image}
          alt={name}
        />
      )}

      {!image && (
        <>
          <div className="image-container">
            <svg
              onClick={handleImageClick}
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              strokeLinejoin="round"
              strokeLinecap="round"
              viewBox="0 0 24 24"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="icon-imagePicker"
            >
              <polyline points="16 16 12 12 8 16"></polyline>
              <line y2="21" x2="12" y1="12" x1="12"></line>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
              <polyline points="16 16 12 12 8 16"></polyline>
            </svg>
          </div>
          <p
            className="image-container"
            style={{ color: "var(--ion-color-primary)", paddingBottom: "20px" }}
          >
            {text ? text : "You can upload an image here"}
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePicker;
