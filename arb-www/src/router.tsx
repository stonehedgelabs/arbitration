import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppleLogin from "./views/AppleLogin.tsx";
import GoogleLogin from "./views/GoogleLogin.tsx";
import { InvalidDevice } from "./views/InvalidDevice.tsx";
import { Login } from "./views/Login.tsx";
import Main from "./views/Main.tsx";
import Onboarding from "./views/Onboarding.tsx";
import { Splash } from "./views/Splash.tsx";
import { WelcomeOnboarding } from "./views/WelcomeOnboarding.tsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin/apple" element={<AppleLogin />} />
        <Route path="/signin/google" element={<GoogleLogin />} />
        <Route path="/welcome" element={<WelcomeOnboarding />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={<Main />} />
        <Route path="/invalid-device" element={<InvalidDevice />} />

        {/* New app routes */}
        <Route path="/fyp" element={<Main />} />
        <Route path="/scores/:league" element={<Main />} />
        <Route path="/scores/:league/:gameId" element={<Main />} />
        <Route path="/live/:league" element={<Main />} />
        <Route path="/social/:league" element={<Main />} />
        <Route path="/bet" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}
