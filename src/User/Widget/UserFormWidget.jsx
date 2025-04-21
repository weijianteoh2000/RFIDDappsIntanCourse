import React, { useState, useEffect } from 'react';
import { ref, onValue, off, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../Backend/firebase/firebase-config";
import { toast } from 'react-toastify';
import CustomToast from "../../Component/customtoast/CustomToast";
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

const UserFormWidget = ({
  initialData,
  setUserModal,
  handleSubmit,
  handleClose,
  isEditMode,
  allDepartment = false
}) => {
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState(initialData);
  const [departmentList, setDepartmentList] = useState([]);
  const [positionList, setPositionList] = useState([]);

  useEffect(() => {
    const departmentRef = ref(database, "Constant/Admin/Department");
    const positionRef = ref(database, "Constant/Admin/Position");
    const adminDepartment = sessionStorage.getItem("department");
    const adminRole = sessionStorage.getItem("adminRole");
    const updateDepartmentList = (snapshot) => {
      if (snapshot.exists()) {
        if(adminRole == "SuperAdmin" || allDepartment) {
          setDepartmentList(Object.values(snapshot.val()));
        } else {
          const filteredDepartment = Object.values(snapshot.val()).find(department => department === adminDepartment);
          setDepartmentList(filteredDepartment ? [filteredDepartment] : []);
        }
      } else {
        setDepartmentList([]);
      }
    };
    const updatePositionList = (snapshot) => {
      if (snapshot.exists()) {
        setPositionList(Object.values(snapshot.val()));
      } else {
        setPositionList([]);
      }
    };
    onValue(departmentRef, updateDepartmentList);
    onValue(positionRef, updatePositionList);
    return () => {
      off(departmentRef, updateDepartmentList);
      off(positionRef, updatePositionList);
    };
  }, []);

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
          const phonePattern = /^\d{10,11}$/; // Assuming 10 0r 11 digits for user phone number
          if (!phonePattern.test(value)) {
            error = "Phone number must be 10 or 11 digits";
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

    setUserModal((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkICUnique = async (ic) => {
    return new Promise((resolve) => {
      const icQuery = query(ref(database, "Users"), orderByChild("ic"), equalTo(ic));

      onValue(icQuery, (snapshot) => {
        const data = snapshot.val();
        const isUnique = !data || (
          isEditMode &&
          Object.keys(data).some(key => data[key].ic === initialData.ic)
        );
        resolve(isUnique);
      }, {
        onlyOnce: true,
      });
    });
  };

  const handleFormSubmit = async () => {
    const fieldsToValidate = [
      "name",
      "email",
      "ic",
      //"employeeID",
      "walletAddress",
      "address",
      "phoneNumber",
      "department",
      "position",
      "password",
    ];
    let allValid = true;
    const newErrors = {};

    for (const key of fieldsToValidate) {
      const error = validateInput(key, formValues[key]);
      if (error) {
        allValid = false;
        newErrors[key] = error;
      }
    }

    setErrors(newErrors);

    if (allValid) {
      const isUnique = await checkICUnique(formValues.ic);

      if (isUnique) {
        handleSubmit(formValues);
        isEditMode 
        ? toast(<CustomToast message="Informasi pengguna telah dikemaskini." />)
        : toast(<CustomToast message="Pengguna telah didaftarkan." />)
        handleClose();
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ic: "IC must be unique.",
        }));
        console.log("Form not submitted due to IC not being unique.");
      }
    } else {
      console.log("Form not submitted due to validation errors.");
      console.log("Errors: ",newErrors);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000, // Increased width for two columns
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h6">
        {isEditMode ? "Kemaskini Pengguna" : "Daftar Pengguna"}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                Nama <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                Alamat Emel <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="email"
            value={formValues.email}
            onChange={handleInputChange}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                No. MyKad <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="ic"
            value={formValues.ic}
            onChange={handleInputChange}
            error={Boolean(errors.ic)}
            helperText={errors.ic}
            InputProps={{
              readOnly: isEditMode, // Make IC field read-only when editing
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                No. Telefon <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleInputChange}
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber}
          />
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                Alamat E-Wallet MetaMask <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="walletAddress"
            value={formValues.walletAddress}
            onChange={handleInputChange}
            error={Boolean(errors.walletAddress)}
            helperText={errors.walletAddress}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" error={Boolean(errors.department)}>
            <InputLabel id="department-label">Jabatan / Kementerian </InputLabel>
            <Select
              labelId="department-label"
              label={
                <span>
                  Jabatan / Kementerian<span style={{ color: 'red' }}>*</span>
                </span>
              }
              name="department"
              value={formValues.department}
              onChange={handleInputChange}
            >
              {departmentList.map((department, index) => (
                <MenuItem key={index} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
            {errors.department && (
              <FormHelperText>{errors.department}</FormHelperText>
            )}
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                Alamat Pejabat <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="address"
            value={formValues.address}
            onChange={handleInputChange}
            error={Boolean(errors.address)}
            helperText={errors.address}
          />
          <TextField
            margin="normal"
            fullWidth
            label={
              <span>
                Jawatan <span style={{ color: 'red' }}>*</span>
              </span>
            }
            name="position"
            value={formValues.position}
            onChange={handleInputChange}
            error={Boolean(errors.position)}
            helperText={errors.position}
          />
          {!isEditMode && (
            <TextField
              margin="normal"
              fullWidth
              label={
                <span>
                  Kata Laluan <span style={{ color: 'red' }}>*</span>
                </span>
              }
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleInputChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
          )}
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFormSubmit}
        sx={{ mt: 3, mr: 2  }}
      >
        {isEditMode ? "Kemaskini" : "Hantar"}
      </Button>
      <Button
        variant="outlined" // Make this button outlined to differentiate it
        color="secondary"
        onClick={handleClose} // Close the form when Cancel is clicked
        sx={{ mt: 3 }}
      >
        Batal
      </Button>
    </Box>

  );
};

export default UserFormWidget;
