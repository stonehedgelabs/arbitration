import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppleLogin from "./views/AppleLogin.tsx";
import GoogleLogin from "./views/GoogleLogin.tsx";
import { InvalidDevice } from "./views/InvalidDevice.tsx";
import { Login } from "./views/Login.tsx";
import { Splash } from "./views/Splash.tsx";
import { BoxScore } from "./views/BoxScore.tsx";
import Scores from "./views/Scores";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin/apple" element={<AppleLogin />} />
        <Route path="/signin/google" element={<GoogleLogin />} />
        <Route path="/invalid-device" element={<InvalidDevice />} />
        <Route path="/scores/:league" element={<Scores />} />
        <Route
          path="/scores/:league/:gameId"
          element={<BoxScore onBack={() => window.history.back()} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
