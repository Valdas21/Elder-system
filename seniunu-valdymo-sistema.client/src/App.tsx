import { Routes, Route} from "react-router-dom";
import LandingPage from "./LandingPage";
import Register from "./Register";
import Login from "./Login";
import Elder from "./Elder";
import Forms from "./Forms";
import Form from "./Form";
import Submissions from "./Submissions";
import SubmissionResponses from "./SubmissionResponses";
import AdminDashboard from "./AdminDashboard";
import Questions from "./Questions";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Elder" element={<Elder />} />
      <Route path="/Forms" element={<Forms />} />
      <Route path="/Form/:id" element={<Form />} />
      <Route path="/Submissions" element={<Submissions />} />
      <Route path="/Submissions/:id/Responses" element={<SubmissionResponses />} />
      <Route path="/Admin" element={<AdminDashboard />} />
      <Route path="/Questions" element={<Questions />} />
    </Routes>
  );
}

export default App;