import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const  Me = ({ children })=>{
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}