import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AccessDeniedModal } from "../modals/AccessDenied";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ allowedRoles }) {
  const [showModal, setShowModal] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    let timer;

    if (token) {
      try {
        // Decode the token
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        // Check if the token is expired
        if (decoded.exp < currentTime) {
          handleLogout(); // Token is expired, log out immediately
        } else {
          // Set a timeout to auto-logout when the token expires
          const remainingTime = (decoded.exp - currentTime) * 1000; // Convert to milliseconds
          timer = setTimeout(handleLogout, remainingTime);
          console.log("Token expires in:", remainingTime / 1000, "seconds");
          // Role check (independent of the timer)
          if (!allowedRoles.includes(role)) {
            setShowModal(true); // Show modal if role is not allowed
          } else {
            setShowModal(false); // Hide modal if role is allowed
          }
        }
      } catch (err) {
        handleLogout(); // If decoding fails, log out immediately
      }
    } else {
      setRedirectToLogin(true); // No token, redirect to login
    }

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, [token, role, allowedRoles]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRedirectToLogin(true);
    window.location.reload(); // Reload the page to clear any state
  };

 // If no token or a redirect is triggered, navigate to login
  if (!token || redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  // If the user doesn't have access, show the modal
  if (showModal) {
    return (
      <AccessDeniedModal 
        onClose={() => {
          setRedirectToLogin(true); // Redirect to login after modal is closed
        }} 
      />
    );
  }

  // Render child components if the user has access
  return <Outlet />;
}
