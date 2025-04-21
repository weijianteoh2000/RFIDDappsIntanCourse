import { Typography, Container, Box } from "@mui/material";
import AdminTableWidget from "./Widget/AdminTableWidget";
import AddAdminModal from "./Widget/AddAdminModal";
import { ref, onValue, off, remove, set } from "firebase/database";
import { database } from "../Backend/firebase/firebase-config";
import { useEffect, useState, useCallback } from "react";
import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";

const AdminPage = () => {
  //use for generating random adminI
  const user = JSON.parse(sessionStorage.getItem("user"));
  const myAlphabet = "0123456789";
  const nanoid = customAlphabet(myAlphabet, 10);
  const [tableKey, setTableKey] = useState(Date.now());
  const [adminList, setAdminList] = useState([]);
  const [admin, setAdmin] = useState({
    address: "",
    adminID: "",
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
    role: "Admin",
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

  const addAdmin = () => {
    const id = nanoid();
    const adminRef = ref(database, `Admins/${id}`);
    const newAdmin = {
      address: admin.address,
      adminID: id,
      department: admin.department,
      email: admin.email,
      ic: admin.ic,
      name: admin.name,
      createdDate: getCurrentDateTime(),
      password: bcrypt.hashSync(admin.password, 10),
      phoneNumber: admin.phoneNumber,
      position: admin.position,
      walletAddress: admin.walletAddress,
      //employeeID: admin.employeeID,
      role: "Admin",
    };

    set(adminRef, newAdmin)
      .then(() => {
        console.log("Admin added successfully");
       setTableKey(Date.now());
      })
      .catch((error) => {
        console.error("Error adding admin: ", error);
      });
  };

  const updateAdmin = () => {
    const adminRef = ref(database, `Admins/${admin.adminID}`);
    set(adminRef, admin)
      .then(() => {
        console.log("Admin updated successfully");
      //  setTableKey(Date.now());
      })
      .catch((error) => {
        console.error("Error updating admin: ", error);
      });
  };

  const deleteAdmin = (adminID) => {
    const adminRef = ref(database, `Admins/${adminID}`);
    remove(adminRef)
      .then(() => {
        console.log("Admin deleted successfully");
        setTableKey(Date.now());
      })
      .catch((error) => {
        console.error("Error deleting admin: ", error);
      });
  };

  useEffect(() => {
    const adminRef = ref(database, "Admins");

    const updateAdminList = (snapshot) => {
      if (snapshot.exists()) {
        const admin = Object.values(snapshot.val());
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
        const sortedAdmin= admin.sort((a, b) => {
          const dateA = parseDate(a.createdDate);
          const dateB = parseDate(b.createdDate);
    
          // If date parsing failed, handle gracefully
          if (!dateA || !dateB) {
            console.error(`Error parsing dates: ${dateA}, ${dateB}`);
            return 0; // Keep original order if sorting fails
          }
    
          return dateB - dateA; // Sort in descending order
        });

        setAdminList(sortedAdmin);
        setTableKey(Date.now());
      } else {
        setAdminList([]);
        setTableKey(Date.now());
      }
    };
    onValue(adminRef, updateAdminList);
    return () => {
      off(adminRef, updateAdminList);
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
          Senarai Admin
        </Typography>
        <AddAdminModal admin={admin} setAdmin={setAdmin} addAdmin={addAdmin} />
      </Box>
      <AdminTableWidget
        admin={admin}
        setAdmin={setAdmin}
        adminList={adminList}
        deleteAdmin={deleteAdmin}
        updateAdmin={updateAdmin}
      />
    </Container>
  );
};

export default AdminPage;
