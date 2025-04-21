import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import DeleteAdminModal from "./DeleteAdminModal";
import EditAdminModal from "./EditAdminModal";
import ViewAdminDialog from "./ViewAdminDialog";
import { toast } from "react-toastify";
import CustomToast from "../../Component/customtoast/CustomToast";
import { set } from "firebase/database";

const AdminTableWidget = ({
  admin,
  setAdmin,
  adminList,
  deleteAdmin,
  updateAdmin,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAdminID, setSelectedAdminID] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const columns = [
    {
      field: "ic",
      headerName: "No. MyKad",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "name",
      headerName: "Nama",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "department",
      headerName: "Jabatan / Kementerian ",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "position",
      headerName: "Jawatan",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    // {
    //   field: "employeeID",
    //   headerName: "ID Pekerja",
    //   flex: 1,
    //   headerClassName: "super-app-theme--header",
    // },
    {
      field: "phoneNumber",
      headerName: "Nombor Telefon",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "walletAddress",
      headerName: "Alamat E-wallet MetaMask",
      flex: 1.2,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "actions",
      headerName: "Tindakan",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div>
          {/* <IconButton onClick={() => openViewDialog(params.row.adminID)}>
            <VisibilityIcon color="primary" />
          </IconButton> */}
          <IconButton onClick={() => openEditModal(params.row.adminID)}>
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.adminID)}>
            <DeleteIcon color="error" />
          </IconButton>
        </div>
      ),
    },
  ];

  const openDeleteModal = (adminID) => {
    setSelectedAdminID(adminID);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAdminID(null);
  };

  const handleConfirmDelete = (adminID) => {
    deleteAdmin(adminID);
    toast(<CustomToast message="Akaun admin berjaya dipadam." />)
    handleCloseDeleteModal();
  };

  const openEditModal = (adminID) => {
    const adminToEdit = adminList.find((admin) => admin.adminID === adminID);
    if (adminToEdit) {
      const editAdminData = {
        ...adminToEdit,
      }
      setAdminToEdit(editAdminData);
      setAdmin(editAdminData);
      setSelectedAdminID(adminID);
      setAdminModal(true);
    }
    setAdminModal(true);
  };

  const handleCloseEditModal = () => {
    setAdminModal(false);
    setAdmin({
      address: "",
      adminID: "",
      department: "",
      email: "",
      ic: "",
      name: "",
      password: "",
      phoneNumber: "",
      position: "",
      walletAddress: "",
      //employeeID: "",
      role: "Admin",
    });
  };

  const handleUpdateAdmin = () => {
    updateAdmin();
    handleCloseEditModal();
  };

  const openViewDialog = (adminID) => {
    setViewDialogOpen(true);
    adminList.forEach((admin) => {
      if (admin.adminID == adminID) {
        setSelectedAdmin(admin);
      }
    });
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedAdmin(null);
  };

  const getRowId = (row) => row.adminID;

  return (
    <Box>
      <DataGrid
        rows={adminList}
        columns={columns}
        getRowId={getRowId}
        hideFooter={true}
        localeText={{
          noRowsLabel: "", // Tidak ada rekod dijumpai
        }}
        sx={{
          border: 'none',
          autoheight: true,
          "& .super-app-theme--header": {
            backgroundColor: "#636DCF",
            color: "#000",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#F0F0F0",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#FFFFFF",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#D3D3D3", // Change this to your desired color for selected rows
            "&:hover": {
              backgroundColor: "#D3D3D3", // Ensure the hover effect does not change the color
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            overflow: "visible !important", // ensures height fits to content
          },
          "& .MuiDataGrid-main": {
            minHeight: 'auto !important',
            height: 'auto !important',
          }
        }}
      />
      <DeleteAdminModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleConfirm={handleConfirmDelete}
        adminID={selectedAdminID}
      />
      <EditAdminModal
        open={adminModal}
        handleClose={handleCloseEditModal}
        admin={adminToEdit || admin}
        setAdmin={setAdmin}
        updateAdmin={handleUpdateAdmin}
      />
      {selectedAdmin && (
        <ViewAdminDialog
          open={viewDialogOpen}
          handleClose={handleCloseViewDialog}
          admin={selectedAdmin}
        />
      )}
    </Box>
  );
};

export default AdminTableWidget;
