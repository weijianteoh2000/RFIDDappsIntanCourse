import { Button, Modal } from "@mui/material";
import AdminFormWidget from "./AdminFormWidget";
import { useState } from "react";

const AddAdminModal = ({ admin, setAdmin, addAdmin }) => {
  const [adminModal, setAdminModal] = useState(false);
  const handleModalOpen = () => {
    setAdminModal(true);
  };

  const handleModalClose = () => {
    setAdminModal(false);
    setAdmin({
      address: "",
      adminID: "",
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
  };
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleModalOpen}>
        Daftar Admin
      </Button>
      <Modal open={adminModal} onClose={handleModalClose}>
        <AdminFormWidget
          initialData={admin}
          setAdminModal={setAdmin}
          handleSubmit={addAdmin}
          handleClose={handleModalClose}
          isEditMode={false}
        />
      </Modal>
    </>
  );
};

export default AddAdminModal;
