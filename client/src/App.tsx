import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./pages/chat";
import Signup from "./pages/auth/signup";
import Signin from "./pages/auth/signin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
