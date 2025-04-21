import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import { Edit } from "@mui/icons-material";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import { toast } from "react-toastify";
import CustomToast from "../../Component/customtoast/CustomToast";

const UserTableWidget = ({
  user,
  setUser,
  userList,
  deleteUser,
  updateUser,
}) => {
  const [editingUser, setEditingUser] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
    {
      field: "phoneNumber",
      headerName: "Nombor Telefon",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "walletAddress",
      headerName: "Alamat E-Wallet MetaMask",
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
          <IconButton onClick={() => openEditModal(params.row.userID)}>
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.userID)}>
            <DeleteIcon color="error" />
          </IconButton>
        </div>
      ),
    },
  ];

  const openDeleteModal = (userID) => {
    const userToDelete = userList.find(u => u.userID === userID);
    if (userToDelete) {
      setUserToDelete(userToDelete);
      setSelectedUserID(userID);
      setDeleteModalOpen(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUserID(null);
    setUserToDelete(null);
  };

  const handleConfirmDelete = (userID) => {
    deleteUser(userID);
    toast(<CustomToast message="Anda telah memadam akaun pengguna." />);
    handleCloseDeleteModal();
  };

  const openEditModal = (userID) => {
    const userToEdit = userList.find(u => u.userID === userID);
    if (userToEdit) {
      //save to editUserData first
      const editUserData = { ...userToEdit };
      setEditingUser(editUserData);
      setUser(editUserData);
      setUserModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setUserModal(false);
    setEditingUser(null);
    setUser({
      address: "",
      userID: "",
      department: "",
      email: "",
      ic: "",
      name: "",
      password: "",
      phoneNumber: "",
      position: "",
      walletAddress: "",
      role: "User",
    });
  };

  const handleUpdateUser = () => {
    updateUser();
    handleCloseEditModal();
  };

  const getRowId = (row) => row.userID;
  return (
    <Box>
      <DataGrid
        rows={userList}
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
      <EditUserModal
        open={userModal}
        handleClose={handleCloseEditModal}
        user={editingUser || user}//only editingUser is null, user data is used
        setUser={setUser}
        updateUser={handleUpdateUser}
      />
      <DeleteUserModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleConfirm={handleConfirmDelete}
        userID={selectedUserID}
      />
    </Box>
  );
};

export default UserTableWidget;
