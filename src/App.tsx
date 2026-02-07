import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home";
import Demo from "./pages/demo";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
