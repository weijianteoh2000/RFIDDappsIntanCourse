import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Typography, Box, Modal } from "@mui/material";
import { useState } from "react";
import HorizontalBars from "./Widget/HorizontalBars";

const CardComponent = ({ title, icon, value, PopUpComponent, popUpProps }) => {
  //state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <Card
        sx={{
          justifySelf: "center",
          width: "80%",
          height: 275,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
          padding: 2,
          textOverflow: "ellipsis",
        }}
        onClick={handleOpen}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "center", lg: "start" },
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                paddingLeft: { xs: 0, lg: 3 },
                fontSize: {
                  xs: "1.5rem",
                  sm: "2rem",
                  lg: "2.25rem",
                  xl: "2.5rem",
                },
                paddingTop: { xs: 0, lg: 1 },
              }}
            >
              {title}
            </Typography>
            <Box
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column-reverse", lg: "row" },
                paddingLeft: { xs: 0, lg: 2 },
                width: "100%",
                justifyContent: "space-between",
                paddingTop: { xs: 5, lg: 0 },
              }}
            >
              <Typography
                variant="h3"
                fontWeight={600}
                sx={{
                  paddingLeft: { xs: 0, lg: 5 },
                  paddingTop: { xs: 3, lg: 3 },
                  fontSize: {
                    xs: "1.5rem",
                    sm: "2rem",
                    lg: "3rem",
                    xl: "4rem",
                  },
                }}
              >
                {value}
              </Typography>
              <Box
                component="img"
                src={icon}
                alt="icon"
                sx={{
                  width: { xs: 75, sm: 100, lg: 125, xl: 150 },
                  height: { xs: 75, sm: 100, lg: 125, xl: 150 },
                  paddingRight: { xs: 0, lg: 5 },
                  paddingBottom: { xs: 0, lg: 5 },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Modal
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        open={open}
        onClose={handleClose}
      >
        <Box
          sx={{
            backgroundColor: "white",
            width: { xs: "90%", lg: "65%" },
            height: "80%",
            borderRadius: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {PopUpComponent && <PopUpComponent {...popUpProps} />}
        </Box>
      </Modal>
    </>
  );
};

export default CardComponent;
