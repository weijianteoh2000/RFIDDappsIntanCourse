import { React, useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { database } from "../../Backend/firebase/firebase-config";
import { get, ref, set } from "firebase/database";
import bcrypt from "bcryptjs";
import AppContext from "../../Context/AppContext";
import "./Login.css";
import { connectWallet } from "../../Backend/privateNetwork/contract";
import { useLoading } from "../../Context/LoadingContext";
import { customAlphabet } from "nanoid";
import AddUserModal from "../../User/Widget/AddUserModal";
import { create } from "qrcode";

function Login({ role }) {
  const navigate = useNavigate();
  const [mykad, setMykad] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState({
    address: "",
    userID: "",
    department: "",
    createdDate: getCurrentDateTime(),
    email: "",
    ic: "",
    name: "",
    password: "",
    phoneNumber: "",
    position: "",
    walletAddress: "",
    //employeeID: "",
    role: "User",
  });

  const { account, setAccount } = useContext(AppContext);
  const { showLoader, hideLoader } = useLoading();
  console.log("Connecting to wallet...", account);
  const connectEthWallet = async () => {
    try {
      const account = await connectWallet();
      setAccount(account);
      return account;
    } catch (err) {
      console.error("Error connecting to wallet:", err);
    }
  };
  function getCurrentDateTime() {
    const now = new Date();
  
    // Get individual components
    const day = String(now.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Construct the formatted date string
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
  //after login, direct user to user home page (program list), set the role as USER
  const login = async (e) => {
    e.preventDefault();
    const regex = /^[0-9]{6}-[0-9]{2}-[0-9]{4}$/;

    if (!regex.test(mykad)) {
      alert('Sila masukKan IC dengan format "123456-12-1234".');
      return;
    }

    const checkUser = async (refPath, role, setRole) => {
      showLoader();
      const dataRef = ref(database, refPath);
      const snapshot = await get(dataRef);

      let foundUser = null;
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();

        const hashedPassword = user.password;
        const isMatch = bcrypt.compareSync(password, hashedPassword);
        if (user.ic === mykad && isMatch && user.walletAddress === account) {
          foundUser = user;
        }
      });

      if (foundUser) {
        sessionStorage.setItem("user", JSON.stringify({ role: role }));
        sessionStorage.setItem("userID", mykad);
        sessionStorage.setItem("name", foundUser.name);
        sessionStorage.setItem("adminRole", foundUser.role);
        sessionStorage.setItem("department", foundUser.department);
        navigate(`/${role.toLowerCase()}/home`);
      } else {
        alert("Salah IC, kata laluan atau alamat e-wallet, sila masukkan semula.");
      }
      hideLoader();
    };

    try {
      if (role === "Admin") {
        await checkUser("Admins", "ADMIN");
      } else {
        await checkUser("Users", "USER");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Ralat berlaku semasa log masuk. Sila cuba lagi.");
    }
  };

  // User registration
  const register = async (e) => {
    try {
      showLoader();
      const nanoid = customAlphabet("0123456789", 10);
      const id = nanoid();
      const dataRef = ref(database, `Users/${id}`);
      const newUser = {
        address: user.address,
        userID: id,
        department: user.department,
        createdDate: getCurrentDateTime(),
        email: user.email,
        ic: user.ic,
        name: user.name,
        password: bcrypt.hashSync(user.password, 10),
        phoneNumber: user.phoneNumber,
        position: user.position,
        walletAddress: user.walletAddress,
        //employeeID: user.employeeID,
        role: "User",
      };
      console.log(newUser);
      await set(dataRef, newUser);
      alert("Anda berjaya daftar akaun.");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Ralat berlaku semasa pendaftaran. Sila cuba lagi.");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <div className="loginPage">
        <div className="loginContainer">
          <div className="titleLogin">
            <h1>{role === "Admin" ? "Log Masuk Sebagai Admin" : "Log Masuk Sebagai Pengguna"}</h1>
          </div>
          {/*User login form */}
          <form
            className="loginForm"
            action="senarai-program-sedia-ada"
            onSubmit={login}
          >
            <label htmlFor="LoginMyKad">
              No. Mykad:
              <input
                id="LoginMyKad"
                name="LoginMyKad"
                type="text"
                placeholder="000000-00-0000"
                minLength="14"
                maxLength="14"
                onChange={(event) => {
                  setMykad(event.target.value);
                }}
              />
            </label>
            <br></br>
            <label htmlFor="LoginPassword">
              Kata Laluan:
              <input
                id="LoginPassword"
                name="LoginPassword"
                type="password"
                placeholder="Password"
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </label>

            <div style={{ paddingTop: "50px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={connectEthWallet}
              >
                Sambung ke MetaMask Wallet
              </Button>
              <div style={{ paddingTop: "20px" }}>Akaun yang anda log masuk: </div>
              <div className="displayAcc">
                <div>{account}</div>
              </div>
            </div>

            <button className="login" type="Submit">
              Masuk
            </button>
          </form>
          {role === "User" ? (
            <AddUserModal
              text={"Daftar Akaun"}
              user={user}
              setUser={setUser}
              addUser={register}
              allDepartment={true}
            />
          ) : (
            null
          )}
          <div className="otherLinks">
            {role === "User" ? (
              <NavLink className="otherlink" to="/admin-login">
                Log Masuk Sebagai Admin
              </NavLink>
            ) : (
              <NavLink className="otherlink" to="/login">
                Log Masuk Sebagai Pengguna
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
