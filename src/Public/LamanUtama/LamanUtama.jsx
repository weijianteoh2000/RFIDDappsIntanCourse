import { React } from "react";
import { NavLink } from "react-router-dom";
import "./LamanUtama.css";

export default function LamanUtama() {
  //get the user role, if user had login, the main page will display Dashboard button.
  //If no logged, it will display login button
  let user = JSON.parse(sessionStorage.getItem("user"));

  const roleChoice = () => {
    if (user && user.role === "ADMIN") {
      return true;
    } else {
      return false;
    }
  };

  const authIdentify = () => {
    if (user) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="mainPageContent">
        <div className="content-container">
          <div className="description">
            <h1 className="title">INTAN</h1>
            <hr className="lineBreak" />
            <p className="white">
            Bagi memastikan aset dapat dikesan dengan lebih berkesan, INTAN menyediakan kemudahan pemantauan pergerakan aset melalui sistem RFID yang telah dipasang. Maklumat aset akan disimpan dalam "Private Blockchain" INTAN, bagi memudahkan pengurusan aset dengan lebih efisien dan meningkatkan tahap keselamatan.
            </p>
            {/* Dashboard button for user who had logged in, Log Masuk button for others */}
            <button className="login-Btn">
              {authIdentify() ? (
                roleChoice() ? (
                  <NavLink className="LoginBtn" to="/admin/home">
                    Papan Pemuka
                  </NavLink>
                ) : (
                  <NavLink className="LoginBtn" to="/user/home">
                    Papan Pemuka
                  </NavLink>
                )
              ) : (
                <NavLink className="LoginBtn" to="/login">
                  Log Masuk
                </NavLink>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
