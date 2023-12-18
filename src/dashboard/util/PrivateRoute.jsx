import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

const PrivateRoutes = () => {
    const userToken = localStorage.getItem('user-token');
    return userToken ? <Outlet /> : <Navigate to="auth/login" />;
  };

export default PrivateRoutes;
