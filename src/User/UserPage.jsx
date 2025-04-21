import { Typography, Container, Box } from "@mui/material";
import {
  ref,
  onValue,
  off,
  remove,
  set,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { database } from "../Backend/firebase/firebase-config";
import bcrypt from "bcryptjs";
import { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { useLoading } from "../Context/LoadingContext";

import AddUserModal from "./Widget/AddUserModal";
import UserTableWidget from "./Widget/UserTableWidget";

const UserPage = () => {
  const department = sessionStorage.getItem("department");
  const adminRole = sessionStorage.getItem("adminRole");
  const myAlphabet = "0123456789";
  const nanoid = customAlphabet(myAlphabet, 10);
  const [tableKey, setTableKey] = useState(Date.now());
  const [userList, setUserList] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const [user, setUser] = useState({
    address: "",
    userID: "",
    createdDate: getCurrentDateTime(),
    department: "",
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
  const addUser = async (e) => {
    try {
      showLoader();
      const id = nanoid();
      const userRef = ref(database, `Users/${id}`);
      const newUser = {
        address: user.address,
        userID: id,
        department: user.department,
        email: user.email,
        ic: user.ic,
        name: user.name,
        createdDate: getCurrentDateTime(),
      password: bcrypt.hashSync(user.password, 10),
        phoneNumber: user.phoneNumber,
        position: user.position,
        walletAddress: user.walletAddress,
        //employeeID: user.employeeID,
        role: "User",
      };
      console.log(newUser);
      set(userRef, newUser)
        .then(() => {

        })
        .catch((error) => {
          console.error("Error adding user: ", error);
        });
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Ralat berlaku semasa pendaftaran. Sila cuba lagi.");
    } finally {
      hideLoader();
    }
  };

  const updateUser = () => {
    const userRef = ref(database, `Users/${user.userID}`);
    set(userRef, user)
      .then(() => {
        console.log("User updated successfully");
      })
      .catch((error) => {
        console.error("Error updating user: ", error);
      });
  };

  const deleteUser = (userID) => {
    const userRef = ref(database, `Users/${userID}`);
    remove(userRef)
      .then(() => {
        console.log("User deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  };

  useEffect(() => {
    const userRef = ref(database, "Users");
    const userQuery = query(
      userRef,
      orderByChild("department"),
      equalTo(department)
    );

    const updateUserList = (snapshot) => {
      if (snapshot.exists()) {
        const users = Object.values(snapshot.val());
    
        const parseDate = (dateString) => {
          const [datePart, timePart] = dateString.split(" ");
          const [day, month, year] = datePart.split("-");
          const [hours, minutes, seconds] = timePart.split(":");
    
          // Check if all parts are defined
          if (!day || !month || !year || !hours || !minutes || !seconds) {
            console.error(`Invalid date format: ${dateString}`);
            return null; // Return null if parsing fails
          }
    
          // Create a new Date object
          return new Date(year, month - 1, day, hours, minutes, seconds); // Month is 0-indexed
        };
    
        // Sort the users by createdDate
        const sortedUsers = users.sort((a, b) => {
          const dateA = parseDate(a.createdDate);
          const dateB = parseDate(b.createdDate);
    
          // If date parsing failed, handle gracefully
          if (!dateA || !dateB) {
            console.error(`Error parsing dates: ${dateA}, ${dateB}`);
            return 0; // Keep original order if sorting fails
          }
    
          return dateB - dateA; // Sort in descending order
        });
    
        // Log the sorted users for debugging
        console.log('Sorted Users:', sortedUsers);
    
        // Update the userList state with the sorted users
        setUserList(sortedUsers);
        // Remove this line as we don't need to force remount the table
        // setTableKey(Date.now());
      } else {
        setUserList([]);
        // Remove this line as we don't need to force remount the table
        // setTableKey(Date.now());
      }
    };
    
    
    if (adminRole === "SuperAdmin") {
      onValue(userRef, updateUserList);
    } else {
      onValue(userQuery, updateUserList);
    }

    return () => {
      off(userQuery, updateUserList);
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ maxHeight: "80vh", overflow: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: 1.5,
          backgroundColor: "rgba(189, 189, 189, 0.8)",
          borderRadius: 1,
        }}
      >
        <Typography variant="h4" color="black">
          Senarai Pengguna
        </Typography>
        <AddUserModal user={user} setUser={setUser} addUser={addUser} />
      </Box>
      <UserTableWidget
        // Remove the key prop as we don't need to force remount
        user={user}
        setUser={setUser}
        userList={userList}
        deleteUser={deleteUser}
        updateUser={updateUser}
      />
    </Container>
  );
};

export default UserPage;
