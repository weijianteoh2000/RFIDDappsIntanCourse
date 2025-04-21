import { Modal } from "@mui/material";
import AdminFormWidget from "./AdminFormWidget";

const EditAdminModal = ({
  open,
  handleClose,
  admin,
  setAdmin,
  updateAdmin,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <AdminFormWidget
        initialData={admin}
        setAdminModal={setAdmin}
        handleSubmit={updateAdmin}
        handleClose={handleClose}
        isEditMode={true}
      />
    </Modal>
  );
};

export default EditAdminModal;
