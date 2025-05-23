import React from "react";
import "./footer.css";
function Footer() {
  return (
    <>
      <div className="footerContainer">
        <div className="footerContent">
          <ul className="contact">
            <li>
              <i className="bi bi-envelope-fill"></i>Alamat Emel
            </li>
            <li>
              <i className="bi bi-telephone-fill"></i>Tel No.
            </li>
            <li>
              <i className="bi bi-geo-alt-fill"></i>Alamat Rumah
            </li>
          </ul>
          <div className="copyRight">CopyRight</div>
        </div>
      </div>
    </>
  );
}

export default Footer;
