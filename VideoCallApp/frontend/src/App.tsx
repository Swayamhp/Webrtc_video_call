import LandingPage from "./pages/LandingPage";
import VideoCallPage from "./pages/VideoCallPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/video-call/:roomId" element={<VideoCallPage />} />
        </Routes>
        <Toaster position="bottom-right" reverseOrder={false} />
      </Router>
    </>
  );
};

export default App;
