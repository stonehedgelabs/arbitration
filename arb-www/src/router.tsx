import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppleLogin from "./views/AppleLogin.tsx";
import GoogleLogin from "./views/GoogleLogin.tsx";
import { InvalidDevice } from "./views/InvalidDevice.tsx";
import { Login } from "./views/Login.tsx";
import Main from "./views/Main.tsx";
import Onboarding from "./views/Onboarding.tsx";
import { Splash } from "./views/Splash.tsx";
import { WelcomeOnboarding } from "./views/WelcomeOnboarding.tsx";
import { BoxScoreV2 } from "./views/BoxScoreV2.tsx";
import ScoresV2 from "./views/ScoresV2.tsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        {/* <Route path="/splash" element={<Splash />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signin/apple" element={<AppleLogin />} />
        <Route path="/signin/google" element={<GoogleLogin />} />
        {/* <Route path="/welcome" element={<WelcomeOnboarding />} />
        <Route path="/onboarding" element={<Onboarding />} /> */}
        {/* <Route path="/app" element={<Main />} /> */}
        <Route path="/invalid-device" element={<InvalidDevice />} />

        {/* New app routes */}
        {/* <Route path="/fyp" element={<Main />} /> */}
        <Route path="/scores/:league" element={<ScoresV2 />} />
        <Route
          path="/scores/:league/:gameId"
          element={<BoxScoreV2 onBack={() => window.history.back()} />}
        />
        {/* <Route path="/scores/:league/:gameId/pbp" element={<Main />} /> */}
        {/* <Route path="/live/:league" element={<Main />} />
        <Route path="/social/:league" element={<Main />} />
        <Route path="/bet" element={<Main />} /> */}

        {/* New ScoresV2 routes */}
        {/*<Route path="/scores" element={<ScoresV2 />} />*/}
        {/*<Route path="/scores/:gameId" element={<BoxScoreV2 onBack={() => window.history.back()} />} />*/}
      </Routes>
    </BrowserRouter>
  );
}
