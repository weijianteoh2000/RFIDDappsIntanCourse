import { Button, Modal } from "@mui/material";
import ItemFormWidget from "./ItemFormWidget";
import { useState } from "react";

const AddItemModal = ({ item, setItem, addItem }) => {
  const [itemModal, setItemModal] = useState(false);
  const handleModalOpen = () => {
    setItemModal(true);
  };

  const handleModalClose = () => {
    setItemModal(false);
    setItem({
      itemID: "",
      name: "",
      location: "",
      RFIDStatus: "",
      blockchainExplorer: "",
      createdBy: "",
      createdByID: "",
      createdTime: "",
      createdDate: "",
      lastUpdatedBy: "",
      lastUpdatedTime: "",
      contractAddress: "",
      rfidStatusUpdatorID: "-",
    });
  };
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleModalOpen}>
        Daftar Item
      </Button>
      <Modal open={itemModal} onClose={handleModalClose}>
        <ItemFormWidget
          initialData={item}
          setItemModal={setItem}
          handleSubmit={addItem}
          handleClose={handleModalClose}
          isEditMode={false}
        />
      </Modal>
    </>
  );
};

export default AddItemModal;
