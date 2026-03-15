import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Learning from "./pages/Learning";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BackButton from "./components/BackButton";
import AuthModal from "./components/AuthModal";
import Practice from "./pages/Practice";
import PracticeQuiz from "./pages/PracticeQuiz";
import { AuthModalProvider } from "./context/AuthModalContext";
import { EnrollModalProvider } from "./context/EnrollModalContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthModalProvider>
          <EnrollModalProvider>
            <AuthModal />
            <BackButton />
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Legacy routes — redirect to home and open modal */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/learn/:id" element={<Learning />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/practice/test/:testId" element={<PracticeQuiz />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EnrollModalProvider>
        </AuthModalProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
