import LandingPage from "./pages/LandingPage";
import VideoCallPage from "./pages/VideoCallPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/call/:roomId" element={<VideoCallPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
