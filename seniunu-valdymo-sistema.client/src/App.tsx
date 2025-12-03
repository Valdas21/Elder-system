import { Routes, Route} from "react-router-dom";
import LandingPage from "./LandingPage";
import Register from "./Register";
import Login from "./Login";
import Elder from "./Elder";
import Forms from "./Forms";
import Form from "./Form";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Elder" element={<Elder />} />
      <Route path="/Forms" element={<Forms />} />
      <Route path="/Form/:id" element={<Form />} />
    </Routes>
  );
}

export default App;