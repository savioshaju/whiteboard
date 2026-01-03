import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WhiteBoard from "./pages/WhiteBoard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/board/default" />} />
        <Route path="/board/:id" element={<WhiteBoard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
