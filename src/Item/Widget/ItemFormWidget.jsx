import React, { useState, useEffect } from "react";
import { ref, onValue, off, remove, set } from "firebase/database";
import { database } from "../../Backend/firebase/firebase-config";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Grid,
} from "@mui/material";
import { toast } from "react-toastify";

const ItemFormWidget = ({
  initialData,
  setItemModal,
  handleSubmit,
  handleClose,
  isEditMode,
}) => {
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState(initialData);

  const validateInput = (name, value) => {
    let error = "";

    if (value.trim() === "") {
      error = "Maklumat ini perlu diisi";
    } else {
      switch (name) {
        case "email":
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            error = "Invalid email address";
          }
          break;
        case "ic":
          const icPattern = /^[0-9]{6}-[0-9]{2}-[0-9]{4}$/;
          if (!icPattern.test(value)) {
            error = 'Please input IC with the format "123456-12-1234"';
          }
          break;
        case "phoneNumber":
          const phonePattern = /^\d{8}$/;
          if (!phonePattern.test(value)) {
            error = "Phone number must be 8 digits";
          }
          break;
        case "password":
          if (!isEditMode && value.length < 8) {
            error = "Password must be at least 8 characters";
          }
          break;
        default:
          break;
      }
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const error = validateInput(name, value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));

    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setItemModal((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFormSubmit = () => {
    const fieldsToValidate = ["name", "location"];
    let allValid = true;
    const newErrors = {};

    fieldsToValidate.forEach((key) => {
      const error = validateInput(key, formValues[key]);
      if (error) {
        allValid = false;
      }
      newErrors[key] = error;
    });

    setErrors(newErrors);

    console.log("Form Values:", formValues);
    console.log("Validation Errors:", newErrors);
    console.log("All Valid:", allValid);

    if (allValid) {
      console.log("Form submitted:", formValues);
      handleSubmit(formValues);
      handleClose();
    } else {
      console.log("Form not submitted due to validation errors.");
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, // Increased width for two columns
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h6">
        {isEditMode ? "Kemaskini Item" : "Daftar Item"}
      </Typography>
      <TextField
        margin="normal"
        fullWidth
        label="Nama"
        name="name"
        value={formValues.name}
        onChange={handleInputChange}
        error={Boolean(errors.name)}
        helperText={errors.name}
      />
      <FormControl fullWidth margin="normal" error={Boolean(errors.location)}>
        <InputLabel id="location-label">Lokasi</InputLabel>
        <Select
          labelId="location-label"
          label="Location"
          name="location"
          value={formValues.location}
          onChange={handleInputChange}
        >
          <MenuItem value="Room A">Room A</MenuItem>
          <MenuItem value="Room B">Room B</MenuItem>
        </Select>
        {errors.department && (
          <FormHelperText>{errors.department}</FormHelperText>
        )}
      </FormControl>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleFormSubmit}>
          {isEditMode ? "Kemaskini Item" : "Daftar Item"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          sx={{ ml: 2 }}
        >
          Batal
        </Button>
      </Box>
    </Box>
  );
};

export default ItemFormWidget;
