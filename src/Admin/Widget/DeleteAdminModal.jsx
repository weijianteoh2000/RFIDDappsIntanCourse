import { Box, Typography, Button, Modal } from "@mui/material";

const DeleteAdminModal = ({ open, handleClose, handleConfirm, adminID }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6">
          Padam
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Adakah anda pasti untuk memadam admin ini?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
            variant="contained"
            color="error"
            onClick={() => handleConfirm(adminID)}
          >
            Ya
          </Button>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Tidak
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteAdminModal;
