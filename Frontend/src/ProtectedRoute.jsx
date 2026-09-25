import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { isAuthenticated } from "./auth";

/**
 * ProtectedRoute component
 * If authenticated -> renders children or Outlet
 * If NOT authenticated -> immediately redirects to "/" with replace to prevent back navigation
 */
export default function ProtectedRoute({ children }) {
  // Synchronous initialization prevents any flicker or exposing protected UI
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [loading] = useState(false);

  useEffect(() => {
    // Keep authentication synchronized across tabs and local state updates
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === null) {
        setAuthed(isAuthenticated());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#212121",
        }}
      >
        <ScaleLoader color="#fff" loading={true} />
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
