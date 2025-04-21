import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';

const ItemStatusChangeModal = ({ open, handleClose, currentStatus, handleConfirm }) => {
  const [arduinoID, setArduinoID] = useState('');

  const newStatus = currentStatus === "Unavailable" ? "Pending" : "Unavailable";

  const modalContent = {
    "Unavailable": {
      title: "Daftar Kad",
      message: "Adakah anda pasti hendak mendaftar kad untuk item ini?",
      confirmText: "Daftar",
      confirmColor: "success",
      confirmBgColor: "#a5d6a7",  // Lighter green color
    },
    "Pending": {
      title: "Batalkan Pendaftaran Kad",
      message: "Adakah anda pasti hendak membatalkan pendaftaran kad untuk item ini?",
      confirmText: "Sahkan",
      confirmColor: "error",
    }
  };

  const { title, message, confirmText, confirmColor, confirmBgColor } = modalContent[currentStatus] || {};

  const handleSubmit = () => {
    if (currentStatus === "Unavailable" && !arduinoID.trim()) {
      alert("Sila masukkan ID Arduino.");
      return;
    }
    handleConfirm(newStatus, arduinoID);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ ...modalStyles }}>
        <Typography variant="h6" component="h2" align="center">
          {title}
        </Typography>
        <Typography sx={{ mt: 2 }}>{message}</Typography>

        {currentStatus === "Unavailable" && (
          <TextField
            fullWidth
            margin="normal"
            label="Arduino ID"
            value={arduinoID}
            onChange={(e) => setArduinoID(e.target.value)}
            InputLabelProps={{
              style: {
                color: 'black', // Set label color to black
              },
            }}
            InputProps={{
              sx: {
                bgcolor: 'white', // Set white background
                borderRadius: 1,   // Optional: rounded corners
              }
            }}
          />
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Button
            variant="contained"
            color={confirmColor}
            onClick={handleSubmit}
            sx={{ bgcolor: confirmBgColor, width: '48%', py: 1.5 }}
          >
            {confirmText}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              width: '48%',
              py: 1.5,
              bgcolor: 'white',
              color: 'black',
              '&:hover': {
                bgcolor: 'white',
                color: 'black',
              }
            }}
          >
            Batal
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'primary.main',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
};

export default ItemStatusChangeModal;
