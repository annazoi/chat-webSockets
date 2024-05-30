import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./pages/chat";

function App() {
  const myStyle = {
    // backgroundImage: `url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
    // height: "100vh",
    // marginTop: "-70px",
    // fontSize: "50px",
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat",
  };
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
