import { Modal } from "@mui/material";
import ItemFormWidget from "./ItemFormWidget";

const EditItemModal = ({ open, handleClose, item, setItem, updateItem }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <ItemFormWidget
        initialData={item}
        setItemModal={setItem}
        handleSubmit={updateItem}
        handleClose={handleClose}
        isEditMode={true}
      />
    </Modal>
  );
};

export default EditItemModal;
