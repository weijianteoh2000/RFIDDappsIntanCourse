import Menuheader from "../menuheader/Menuheader";

const Layout = ({ children }) => {
  const layoutStyle = {
    backgroundImage: "../background.jpg",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed", // Optional
    minHeight: "100vh", // Ensure the background covers the whole screen
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={layoutStyle}>
      <Menuheader />
      {children}
    </div>
  );
};

export default Layout;
