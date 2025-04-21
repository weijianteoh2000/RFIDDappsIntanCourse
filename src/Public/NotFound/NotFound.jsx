import React, { useState } from "react";

function NotFound() {
  const style = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "90vh",
    width: "100%",
    marginTop: "10vh",
    gap: "3rem",
  };

  return (
    <div style={style}>
      <h1>The Page is not found</h1>
    </div>
  );
}

export default NotFound;
