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

const ItemInfoCard = ({ item }) => (
  <Card
    style={{ backgroundColor: "#6B76DD", boxShadow: "none", paddingWidth: 10 }}
  >
    <CardContent style={{ overflowX: "auto" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="black">
        Informasi Item
      </Typography>
      <Grid container spacing={2}>
        {[
          { label: "ID Item", value: item.itemID },
          { label: "Nama Item", value: item.name },
          { label: "Lokasi", value: item.location },
          { label: "Dicipta oleh", value: item.createdBy },
          { label: "Masa dicipta", value: item.createdTime },
          { label: "Dikemaskini oleh", value: item.lastUpdatedBy },
          { label: "Masa dikemaskini", value: item.lastUpdatedTime },
          { label: "Status RFID", value: item.RFIDStatus },
          { label: "Alamat Kontrak", value: item.contractAddress },
          {
            label: "Blockchain Explorer",
            value: (
              <Link
                href={`http://10.10.21.143/#/blockchain/transactionList/transactionDetail/${item.blockchainExplorer}`}
                underline="hover"
                style={{ color: "#000" }}
                target="_blank"
              >
                {item.blockchainExplorer != null
                  ? "Lihat di Blockchain Explorer"
                  : "Tidak wujud di dalam Blockchain Explorer"}
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

const ViewItemDialog = ({ open, handleClose, item }) => {
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
          <ItemInfoCard item={item} />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#6B76DD" }}>
          <Button onClick={handleClose} sx={{ color: "#000" }}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewItemDialog;
