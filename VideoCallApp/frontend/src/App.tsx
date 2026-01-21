import LandingPage from "./pages/LandingPage";
import VideoCallPage from "./pages/VideoCallPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DemoGroup from "./pages/DemoGroup"

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/*" element={<LandingPage />} />
          <Route path="/video-call/:roomId" element={<VideoCallPage />} />
          {/* <Route path="/group-video-call/:roomId" element={<GroupVideoCall />} /> */}
          <Route path="/group-video-call/:roomId" element={<DemoGroup />} />
        </Routes>
        <Toaster position="bottom-right" reverseOrder={false} />
      </Router>
    </>
  );
};

export default App;
