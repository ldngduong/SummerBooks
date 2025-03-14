import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  } 
  if (role === 'admin'){
    if(user && (user.role === 'Quản trị viên' || user.role === 'Nhân viên bán hàng' || user.role === 'Nhân viên nhập liệu')){
      return children
    }
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
