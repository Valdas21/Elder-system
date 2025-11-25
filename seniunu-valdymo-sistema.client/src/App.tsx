import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Register from "./Register";
import Login from "./Login";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />
    </Routes>
  );
}

export default App;