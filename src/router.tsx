import { Routes, Route, HashRouter, Navigate } from "react-router-dom";
import { SplashScreen } from "./views/SplashScreen";
import { LoginScreen } from "./views/LoginScreen";
import AppleSignIn from "./views/AppleSignIn";
import GoogleSignIn from "./views/GoogleSignIn";
import { WelcomeOnboarding } from "./views/WelcomeOnboarding";
import Onboarding from "./views/Onboarding";
import Main from "./views/Main";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signin/apple" element={<AppleSignIn />} />
        <Route path="/signin/google" element={<GoogleSignIn />} />
        <Route path="/welcome" element={<WelcomeOnboarding />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={<Main />} />
      </Routes>
    </HashRouter>
  );
}
