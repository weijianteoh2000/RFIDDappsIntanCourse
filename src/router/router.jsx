import { Routes, Route } from "react-router-dom";
import { React } from "react";
import LamanUtama from "../Public/LamanUtama/LamanUtama";
import Login from "../Public/Login/Login";

import AdminRoutes from "./adminRoutes";
import PublicRoutes from "./publicRoutes";
import UserRoutes from "./userRoutes";

import Dashboard from "../Public/Dashboard/Dashboard";
import AdminPage from "../Admin/AdminPage";
import ItemPage from "../Item/ItemPage";
import UserPage from "../User/UserPage";
function Router() {
  return (
    <>
      <Routes>
        {/*No login required */}
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<LamanUtama />} />
          <Route path="register" element={<Login isRegister />} />
          <Route path="login" element={<Login role="User" />} />
          <Route path="admin-login" element={<Login role="Admin" />} />
        </Route>

        {/*Admin */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin/home" exact element={<Dashboard />} />
          <Route path="/admin/admins" exact element={<AdminPage />} />
          <Route path="/admin/users" exact element={<UserPage />} />
          <Route path="/admin/items" exact element={<ItemPage />} />
        </Route>
        {/*User */}
        <Route element={<UserRoutes />}>
          <Route path="/user/home" exact element={<Dashboard />} />
          <Route path="/user/items" exact element={<ItemPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default Router;
