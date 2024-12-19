import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AccessDeniedModal } from "../modals/AccessDenied";

export default function ProtectedRoute({ allowedRoles }) {
  const [showModal, setShowModal] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (token && !allowedRoles.includes(role)) {
      setShowModal(true);
    }
  }, [token, role, allowedRoles]);

  // If no token or a redirect is triggered, navigate to login
  if (!token || redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  // If the user doesn't have access, show the modal
  if (showModal) {
    return <AccessDeniedModal onClose={() => setRedirectToLogin(true)} />;
  }

  // Render child components if the user has access
  return <Outlet />;
}
