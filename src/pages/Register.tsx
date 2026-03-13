import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "@/context/AuthModalContext";

const Register = () => {
  const navigate = useNavigate();
  const { openModal } = useAuthModal();

  useEffect(() => {
    navigate("/", { replace: true });
    openModal("register");
  }, [navigate, openModal]);

  return null;
};

export default Register;
