import { createContext, useContext, useState, ReactNode } from "react";

type Tab = "login" | "register";

interface AuthModalContextType {
  isOpen: boolean;
  activeTab: Tab;
  openModal: (tab?: Tab) => void;
  closeModal: () => void;
  switchTab: (tab: Tab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("login");

  const openModal = (tab: Tab = "login") => {
    setActiveTab(tab);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const switchTab = (tab: Tab) => setActiveTab(tab);

  return (
    <AuthModalContext.Provider value={{ isOpen, activeTab, openModal, closeModal, switchTab }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
};
