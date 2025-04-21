import { createTheme, responsiveFontSizes } from "@mui/material";

const Theme = createTheme({
    palette: {
        primary: {
            main: "#6B76DD",
        },
    },
});
 
export default responsiveFontSizes(Theme);

