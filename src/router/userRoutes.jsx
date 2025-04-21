import React from "react";
import Menuheader from "../Component/menuheader/Menuheader";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import background from "../background.jpg";

const useAuth = () => {
  //get user from sessionStorage, if there exist user means the user had logged in
  let user;
  const _user = sessionStorage.getItem("user");

  if (_user) {
    user = JSON.parse(_user);
    console.log("user", user);
  }
  if (user) {
    return {
      auth: true,
      role: user.role,
    };
  } else {
    return {
      auth: false,
      role: null,
    };
  }
};

const UserRoutes = () => {
  const location = useLocation();
  const { auth, role } = useAuth();
  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "90vh",
    position: "relative",
  };

  const contentStyle = {
    position: "relative",
    zIndex: 1,
  };
  {
    /* If user is authenticated and the role is USER, the user can access the user pages, else the user will be directed to login page */
  }
  if (auth) {
    return role === "USER" ? (
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default UserRoutes;
