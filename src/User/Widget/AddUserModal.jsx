import { Button, Modal } from "@mui/material";
import UserFormWidget from "./UserFormWidget";
import { useState } from "react";

const AddUserModal = ({ text = "Daftar Pengguna", user, setUser, addUser,allDepartment = false }) => {
  const [userModal, setUserModal] = useState(false);
  const handleModalOpen = () => {
    setUserModal(true);
  };

  const handleModalClose = () => {
    setUserModal(false);
    setUser({
      address: "",
      userID: "",
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
  };
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleModalOpen}>
        {text}
      </Button>
      <Modal open={userModal} onClose={handleModalClose}>
        <UserFormWidget
          initialData={user}
          setUserModal={setUser}
          handleSubmit={addUser}
          handleClose={handleModalClose}
          isEditMode={false}
          allDepartment={allDepartment}
        />
      </Modal>
    </>
  );
};

export default AddUserModal;
