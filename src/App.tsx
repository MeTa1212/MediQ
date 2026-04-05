import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientApp from "./pages/PatientApp";
import NotFound from "./pages/NotFound";

import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorSignUp from "./pages/auth/DoctorSignUp";
import PatientLogin from "./pages/auth/PatientLogin";
import PatientSignUp from "./pages/auth/PatientSignUp";
import SignUp from "./pages/auth/SignUp";

import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/signup/doctor" element={<DoctorSignUp />} />
          <Route path="/login/patient" element={<PatientLogin />} />
          <Route path="/signup/patient" element={<PatientSignUp />} />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientApp />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;