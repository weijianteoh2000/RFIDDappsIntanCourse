import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Link,
} from "@mui/material";

const AdminInfoCard = () => (
  <Card style={{ backgroundColor: "#6B76DD", boxShadow: "none" }}>
    <CardContent>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="black">
        Informasi Admin
      </Typography>
      <Grid container spacing={2}>
        {[
          { label: "No. MyKad Admin", value: "99990001" },
          { label: "Nama Admin", value: "Mohd" },
          { label: "Jabatan / Kementerian", value: "A" },
          { label: "Jawatan", value: "Manager" },
          { label: "ID Pekerja", value: "0001" },
          { label: "No. Telefon", value: "012-2323232" },
          { label: "Alamat Rumah", value: "123, Jln 123, Bandar Aman" },
          { label: "Alamat Emel", value: "mohd@gmail.com" },
          {
            label: "Alamat E-Wallet MetaMask",
            value: (
              <Link href="#" underline="hover" style={{ color: "#000" }}>
                10000001
              </Link>
            ),
          },
        ].map((item, index) => (
          <React.Fragment key={index}>
            <Grid item xs={6}>
              <Typography variant="body1" style={{ color: "#000" }}>
                <strong>{item.label}:</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" style={{ color: "#000" }}>
                {item.value}
              </Typography>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

const ViewAdminDialog = ({ open, handleClose, admin }) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{ color: "primary" }}
      >
        <DialogContent style={{ padding: 0 }}>
          <AdminInfoCard />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#6B76DD" }}>
          <Button onClick={handleClose} sx={{ color: "#000" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewAdminDialog;
