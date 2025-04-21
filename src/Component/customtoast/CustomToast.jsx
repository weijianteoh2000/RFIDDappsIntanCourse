import {
  Box,
  Typography,
  Button,
} from "@mui/material";

const CustomToast = ({ message, closeToast }) => {
  return (
    <Box
      sx={{
        padding: 2,
        bgcolor: "background.paper",
        boxShadow: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
      }}
    >
      <Typography variant="body1" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={closeToast}
        sx={{ width: "100%" }}
      >
        OK
      </Button>
    </Box>
  );
};

export default CustomToast;