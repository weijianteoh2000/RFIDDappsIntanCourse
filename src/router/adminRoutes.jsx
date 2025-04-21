import React from "react";
import Menuheader from "../Component/menuheader/Menuheader";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import background from "../background.jpg";
import { toast } from "react-toastify";
import CustomToast from "../Component/customtoast/CustomToast";

const useAuth = () => {
  //get user from sessionStorage, if there exist user means the user had logged in
  let user;
  const _user = sessionStorage.getItem("user");
  const admin = sessionStorage.getItem("adminRole");

  if (_user) {
    user = JSON.parse(_user);
  }
  if (user) {
    return {
      auth: true,
      role: admin,
    };
  } else {
    return {
      auth: false,
      role: null,
    };
  }
};

const AdminRoutes = () => {
  const { auth, role } = useAuth();
  const location = useLocation();
  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "90vh",
    position: "relative", // Ensures proper stacking context
  };

  const contentStyle = {
    position: "relative", // Ensures content is above the background
    zIndex: 1, // Stack the content above the background
  };
  {
    /* If user is authenticated and the role is ADMIN, the user can access the admin pages, else direct to login page */
  }
  if (auth) {
    // If the admin try to access the admin page, but the role is not SuperAdmin, redirect to login page
    if (location.pathname === "/admin/admins" && role !== "SuperAdmin") {
      toast(<CustomToast message="Anda tidak mempunyai kebenaran untuk mengakses halaman ini." />);
      return <Navigate to="/login" />;
    }

    return role === "Admin" || role === "SuperAdmin" ? (
      <div style={backgroundStyle}>
        <div style={contentStyle}>
          <Menuheader />
          <Outlet />
        </div>
      </div>
    ) : (
      <Navigate to="/login" />
    );
  } else {
    return <Navigate to="/login" />;
  }
};

export default AdminRoutes;
