import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EmailComposer from "./pages/EmailCompose";
import TrackingDashboard from "./pages/TrackingDashboard";
import EmailEvents from "./pages/EmailEvents";
import MainLayout from "./pages/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Authenticated routes with sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path="/compose" element={<EmailComposer />} />
          <Route path="/tracking" element={<TrackingDashboard />} />
          <Route path="/track/:trackingId" element={<EmailEvents />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;