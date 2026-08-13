import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.user);

  // If user exists AND is admin, render the child route (Outlet).
  // Otherwise, redirect to Home.
  return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;