import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/home";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
