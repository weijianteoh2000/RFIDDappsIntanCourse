import React, { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./header.css";
import AppContext from "../../Context/AppContext";
import intanLogo from "../../img/logo-intan-edited.png";

//function to return the menu item
function NavItem(props) {
  return (
    <li>
      <NavLink className={props.cn} to={props.path} onClick={props.close}>
        <i className={props.icon} />
        {props.name}
      </NavLink>
    </li>
  );
}

function Header() {
  //menu icon click, will invert each time clicking
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const { account, setAccount, logout: AppLogout } = useContext(AppContext);

  //Account Pengguna click, will invert each time clicking
  const [subMenuClick, setSubmenuClick] = useState(false);
  const handleSubMenuClick = () => setSubmenuClick(!subMenuClick);

  //close hamburger menu icon
  const closeMobileMenu = () => {
    setClick(false);
    setSubmenuClick(false);
  };

  let menuRef = useRef();
  let subMenuRef = useRef();
  useEffect(() => {
    let handler = (e) => {
      //if the user click the place other than the menu icon, the menu will close
      if (!menuRef.current?.contains(e.target)) {
        setClick(false);
      }
      //if the user click the place other than the Account Pengguna, the submenu will close
      if (!subMenuRef.current?.contains(e.target)) {
        setSubmenuClick(false);
      }
    };
    //attach event handler to the document
    document.addEventListener("mousedown", handler);

    return () => {
      //removes event handler from a document.
      document.removeEventListener("mousedown", handler);
    };
  });

  //get user from local storage
  let user = JSON.parse(sessionStorage.getItem("user"));
  //identify whether the user is logged in
  const authIdentify = () => {
    if (user) {
      return true;
    } else {
      return false;
    }
  };
  //identify the role of the user
  const roleChoice = () => {
    let user = JSON.parse(sessionStorage.getItem("user"));
    if (user.role === "ADMIN") {
      return true;
    } else {
      return false;
    }
  };
  const userName = sessionStorage.getItem("name");
  const navigate = useNavigate();
  //logout

  const logout = () => {
    AppLogout();
  };

  return (
    <React.Fragment>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink className="nav-logo" to="/">
            <img
              id="logo"
              src= {intanLogo}
              alt="Intan logo"
              className="large-image" 
            />
          </NavLink>
          <div ref={menuRef}>
            {/* hamburger menu will show when screen is smaller than 960px, else it is hidden */}
            <div className="menu-icon" onClick={handleClick}>
              <i className={!click ? "bi bi-list" : "bi bi-x-lg"}></i>
            </div>
            {/* nav-menu active class is to display menu in hamburger menu, nav-menu is to display menu in menu bar */}
            <ul
              className={click ? "nav-menu active" : "nav-menu"}
              ref={subMenuRef}
            >
              <NavItem
                cn="navlink"
                path="/"
                icon="bi bi-house-fill"
                name="Laman Utama"
                close={closeMobileMenu}
              />
              {/* identify the header for different user type, if the user is logged in then show user header, else show general header */}
              {authIdentify() ? (
                <li
                  className={
                    subMenuClick
                      ? "menu-has-children active"
                      : "menu-has-children"
                  }
                  onClick={handleSubMenuClick}
                  ref={subMenuRef}
                >
                  <span className="akaun">
                    <i className="bi bi-person-square"></i>{userName}
                  </span>
                  <ul
                    className={subMenuClick ? "sub-menu active" : "sub-menu"}
                  >
                    <NavItem
                      cn="navlink subItem"
                      path=""
                      icon="bi bi-box-arrow-in-left"
                      name="Keluar"
                      close={logout}
                    />
                  </ul>
                </li>
              ) : (
                <li
                  className={
                    subMenuClick
                      ? "menu-has-children active"
                      : "menu-has-children"
                  }
                  onClick={handleSubMenuClick}
                >
                  <span className="akaun">
                    <NavItem
                      cn="navlink subItem"
                      path="/login"
                      icon="bi bi-box-arrow-in-right"
                      name="Log Masuk"
                      close={closeMobileMenu}
                    />
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </React.Fragment>
  );
}

export default Header;
