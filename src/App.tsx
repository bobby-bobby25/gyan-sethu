import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Clusters from "./pages/Clusters";
import Programs from "./pages/Programs";
import Attendance from "./pages/Attendance";
import Donors from "./pages/Donors";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherApp from "./pages/TeacherApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Teacher Mobile App Routes */}
            {/* <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route
              path="/teacher-app"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherApp />
                </ProtectedRoute>
              }
            /> */}
            {/* Protected routes - Admin and Management only */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clusters"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Clusters />
                </ProtectedRoute>
              }
            />
            <Route
              path="/programs"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Programs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donors"
              element={
                <ProtectedRoute allowedRoles={["admin", "management"]}>
                  <Donors />
                </ProtectedRoute>
              }
            />
            
            {/* Attendance - accessible by all roles */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["admin", "management", "teacher"]}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            
            {/* Settings - Admin only */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
