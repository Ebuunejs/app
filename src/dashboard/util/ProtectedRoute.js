import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function ProtectedRoute({ children }) {
    const [isLoggedIn] = useState(false); // Setzen Sie den Authentifizierungsstatus hier
    const userToken = localStorage.getItem('user-token');

    return userToken ? children : <Navigate to="/auth/login" />;
  }

export default ProtectedRoute;