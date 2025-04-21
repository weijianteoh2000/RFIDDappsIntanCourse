import React from "react";
import { NavLink } from "react-router-dom";
import "./menuheader.css";
import { Menu } from "@mui/material";

const Menuheader = () => {
  const adminRole = sessionStorage.getItem("adminRole");

  return (
    <div className="menuheader">
      <ul>
        {adminRole === "Admin" || adminRole === "SuperAdmin" ? (
          <>
            <li>
              <NavLink to="/admin/home" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                Papan Pemuka
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                Senarai Pengguna
              </NavLink>
            </li>
            {adminRole === "SuperAdmin" && (
              <li>
                <NavLink to="/admin/admins" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                  Admin
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/admin/items" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                Item
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/user/home" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                Papan Pemuka
              </NavLink>
            </li>
            <li>
              <NavLink to="/user/items" className={({ isActive }) => (isActive ? "activeLink" : "last")}>
                Item
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Menuheader;
