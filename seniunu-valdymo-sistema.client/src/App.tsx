import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Register from "./Register";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Register" element={<Register />} />
    </Routes>
  );
}

export default App;