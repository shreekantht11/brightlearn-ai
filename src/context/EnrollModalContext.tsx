import React, { createContext, useContext, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthModal } from "./AuthModalContext";
import { API_URL } from "@/lib/api-config";

interface EnrollModalContextType {
  openEnrollModal: (courseId: string, courseTitle: string) => void;
  closeEnrollModal: () => void;
}

const EnrollModalContext = createContext<EnrollModalContextType | undefined>(undefined);

export const useEnrollModal = () => {
  const context = useContext(EnrollModalContext);
  if (!context) {
    throw new Error("useEnrollModal must be used within an EnrollModalProvider");
  }
  return context;
};

export const EnrollModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const { openModal } = useAuthModal();

  const resetModal = () => {
    setIsOpen(false);
    setCourseId("");
    setCourseTitle("");
  };

  const openEnrollModal = (id: string, title: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      openModal("login");
      return;
    }

    setCourseId(id);
    setCourseTitle(title);
    setIsOpen(true);
  };

  const closeEnrollModal = () => {
    if (!enrolling) {
      resetModal();
    }
  };

  const confirmEnroll = async () => {
    setEnrolling(true);
    const token = localStorage.getItem("token");
    if (!token) {
      resetModal();
      openModal("login");
      setEnrolling(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/enroll/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        const alreadyEnrolled = data?.success === false;
        if (alreadyEnrolled) {
          toast.message(data?.message || "You are already enrolled in this course.");
        } else {
          toast.success(data?.message || "Successfully enrolled! View it in your Profile.");
        }

        window.dispatchEvent(new CustomEvent("enrollmentUpdated", {
          detail: { courseId }
        }));
        resetModal();
      } else {
        const message = data?.message || "Enrollment failed. Please log in again.";
        toast.error(message);
        resetModal();

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("storage"));
          openModal("login");
        }
      }
    } catch {
      toast.error("Network error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <EnrollModalContext.Provider value={{ openEnrollModal, closeEnrollModal }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeEnrollModal}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-[10000] w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center shadow-2xl"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Play className="h-8 w-8 text-primary ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Enroll in Course</h2>
                <p className="text-slate-500 mb-8">
                  Are you sure you want to enroll in "{courseTitle}"?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={closeEnrollModal}
                    disabled={enrolling}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-primary text-white hover:bg-primary/90"
                    onClick={confirmEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </EnrollModalContext.Provider>
  );
};
