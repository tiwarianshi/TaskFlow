import { BrowserRouter, Routes, Route } from "react-router-dom";

function LoginPage() {
  return (
    <div className="text-white bg-black min-h-screen flex items-center justify-center text-4xl">
      Login Page Working
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;