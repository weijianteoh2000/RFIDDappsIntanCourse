import { Modal } from "@mui/material";
import UserFormWidget from "./UserFormWidget";

const EditUserModal = ({
  open,
  handleClose,
  user,
  setUser,
  updateUser,
}) => {


  return (
    <Modal open={open} onClose={handleClose}>
        <UserFormWidget
            initialData={user}
            setUserModal={setUser}
            handleSubmit={updateUser}
            handleClose={handleClose}
            isEditMode={true}
        />
    </Modal>
  );
};

export default EditUserModal;