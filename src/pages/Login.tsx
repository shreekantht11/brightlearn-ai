import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/context/AuthModalContext";

const Login = () => {
  const navigate = useNavigate();
  const { openModal } = useAuthModal();

  useEffect(() => {
    navigate("/", { replace: true });
    openModal("login");
  }, [navigate, openModal]);

  return null;
};

export default Login;
