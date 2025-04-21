import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteItemModal from "./DeleteItemModal";
import EditItemModal from "./EditItemModal";
import ViewItemDialog from "./ViewItemDialog";
import ItemStatusChangeModal from "./ItemStatusChangeModal";
import available from "../../img/itemStatus/available-status.png";
import pending from "../../img/itemStatus/pending-status.png";
import unavailable from "../../img/itemStatus/unavailable-status.png";
import {
  changeRFIDStatus,
  upgradeContract,
  getItemDetail,
} from "../../Backend/privateNetwork/contract";
import { set } from "date-fns";
import { toast } from "react-toastify";
import { useLoading } from "../../Context/LoadingContext";
import CustomToast from "../../Component/customtoast/CustomToast";

const ItemTableWidget = ({
  itemList,
  item,
  listType = "current",
  isView = false,
  isUser = false,
  setItem,
  deleteItem,
  updateItem,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemID, setSelectedItemID] = useState(null);
  const [rfidStatusUpdatorID, setRfidStatusUpdatorID] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const { showLoader, hideLoader } = useLoading();
  const [userName, setUserName] = useState(sessionStorage.getItem("name"));
  const [itemToEdit, setItemToEdit] = useState(null);
  const userID = sessionStorage.getItem("userID");
  const isSuperAdmin = sessionStorage.getItem("adminRole") === "SuperAdmin";
  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(sessionStorage.getItem("name"));
    };

    // Listen for changes to sessionStorage
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const columns = [
    {
      field: "bil",
      headerName: "Bil",
      flex: 0.3,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "itemID",
      headerName: "ID Item",
      flex: 0.7,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "name",
      headerName: "Nama",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "createdTime",
      headerName: "Masa Yang Dicipta",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "location",
      headerName: "Lokasi",
      flex: 0.5,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "RFIDStatus",
      headerName: "Status RFID",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const statusImages = {
          Available: available,
          Unavailable: unavailable,
          Pending: pending,
        };

        const imageUrl = statusImages[params.value];

        const handleClick = () => {
          openStatusChangeModal(params.row.itemID);
          setCurrentStatus(params.value);
        };

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ minWidth: 80 }}>{params.value}</span>
            {(params.value === "Pending" ||
              params.value === "Available" ||
              params.value === "Unavailable") && (
                <img
                  src={imageUrl}
                  alt={params.value}
                  style={{
                    height: 50,
                    width: 50,
                    marginRight: 8,
                    cursor:
                      params.value === "Pending" || params.value === "Unavailable"
                        ? "pointer"
                        : "default",
                  }}
                  onClick={
                    params.value === "Pending" || params.value === "Unavailable"
                      ? handleClick
                      : null
                  }
                />
              )}
          </div>
        );
      },
    },
    {
      field: "rfidStatusUpdatorID",
      headerName: "ID Pengemaskini",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", alignItems: "center", textAlign: "center" }}>
            <span style={{ minWidth: 80 }}>{params.value}</span>
          </div>
        );
      },
    },
  ];

  if (!isView) {
    columns.push({
      field: "actions",
      headerName: "Tindakan",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const isDeleted = listType === "deleted";
        return (
          <div>
            <IconButton onClick={() => openViewDialog(params.row.itemID)}>
              <VisibilityIcon color="primary" />
            </IconButton>
            {isUser ? null : (
              <>
                {isSuperAdmin || (params.row.createdByID === userID) ?
                  <>
                    <IconButton
                      onClick={
                        isDeleted ? null : () => openEditModal(params.row.itemID)
                      }
                      disabled={isDeleted}
                    >
                      <EditIcon color={isDeleted ? "disabled" : "primary"} />
                    </IconButton>
                    <IconButton
                      onClick={
                        isDeleted ? null : () => openDeleteModal(params.row.itemID, params.row.rfidStatusUpdatorID)
                      }
                      disabled={isDeleted}
                    >
                      <DeleteIcon color={isDeleted ? "disabled" : "error"} />
                    </IconButton>
                  </>
                  : null
                }
              </>
            )}
          </div>
        );
      },
    });
  }

  const openDeleteModal = (itemID, rfidStatusUpdatorID) => {
    setSelectedItemID(itemID);
    setRfidStatusUpdatorID(rfidStatusUpdatorID);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedItemID(null);
  };

  const handleConfirmDelete = (itemID, rfidStatusUpdatorID) => {
    deleteItem(itemID, rfidStatusUpdatorID);
    handleCloseDeleteModal();
  };

  const openEditModal = (itemID) => {
    const editItemData = itemList.find((item) => item.itemID === itemID);
    if (editItemData) {
      const editedItem = {
        ...editItemData
      };
      setItemToEdit(editedItem);
      setItem(editedItem);
      setItemModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setItemModal(false);
    setItemToEdit(null);
    setItem({
      itemID: "",
      name: "",
      location: "",
      RFIDStatus: "",
      blockchainExplorer: "",
      createdBy: "",
      createdByID: "",
      createdTime: "",
      createdDate: "",
      lastUpdatedBy: "",
      lastUpdatedTime: "",
      contractAddress: "",
      rfidStatusUpdatorID: "-",
    });
  };

  const handleUpdateItem = () => {
    updateItem();
    handleCloseEditModal();
  };

  const openViewDialog = (itemID) => {
    setViewDialogOpen(true);
    itemList.forEach((item) => {
      if (item.itemID === itemID) {
        getItemDetail(item.contractAddress)
          .then((itemDetail) => {
            const itemData = {
              ...item,
              itemID: item.itemID,
              name: itemDetail.itemName,
              location: itemDetail.location,
              RFIDStatus: itemDetail.rfidStatus,
              createdBy: itemDetail.createdBy,
              createdByID: itemDetail.createdByID,
              lastUpdatedBy: itemDetail.lastUpdatedBy,
            };
            setSelectedItem(itemData);
          })
          .catch((error) => {
            console.error("Error getting item detail:", error);
            toast(<CustomToast message="Gagal mendapatkan informasi item." />);
          });
      }
    });
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedItemID(null);
  };

  const openStatusChangeModal = (itemID) => {
    itemList.forEach((item) => {
      if (item.itemID === itemID) {
        setItem({
          itemID: item.itemID,
          name: item.name,
          location: item.location,
          RFIDStatus: item.RFIDStatus,
          blockchainExplorer: item.blockchainExplorer,
          contractAddress: item.contractAddress,
          createdBy: item.createdBy,
          createdByID: item.createdByID,
          createdTime: item.createdTime,
          createdDate: item.createdDate,
          lastUpdatedBy: item.lastUpdatedBy,
          lastUpdatedTime: item.lastUpdatedTime,
          rfidStatusUpdatorID: item.rfidStatusUpdatorID,
        });
      }
    });
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = (newStatus,arduinoID) => {
    try {
      showLoader();
      item.RFIDStatus = newStatus;
      console.log("item: ", item);
      changeRFIDStatus(item.contractAddress, newStatus, userName)
        .then(() => {
          hideLoader();
          item.rfidStatusUpdatorID = arduinoID;
          updateItem();
        })
        .catch((error) => {
          hideLoader();
          toast(<CustomToast message="Gagal menukar status RFID." />);
        });
    } catch (error) {
      hideLoader();
      toast(<CustomToast message="Gagal menukar status RFID." />);
      console.error("Status change failed:", error);
    }

    setStatusModalOpen(false);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setItem({
      itemID: "",
      name: "",
      location: "",
      RFIDStatus: "",
      blockchainExplorer: "",
      createdBy: "",
      createdByID: "",
      createdTime: "",
      createdDate: "",
      lastUpdatedBy: "",
      lastUpdatedTime: "",
      contractAddress: "",
      rfidStatusUpdatorID: "-",
    });
  };

  const getRowId = (row) => row.itemID;

  return (
    <Box
      style={isView ? { width: "80%" } : {}}
      sx={isView ? { height: "auto", maxHeight: "80vh", overflow: "hidden" } : {}}
    >
      <DataGrid
        rows={itemList}
        columns={columns}
        getRowId={getRowId}
        hideFooter={true}
        localeText={{
          noRowsLabel: "", // Custom "no rows" message
        }}
        sx={{
          border: 'none', // 🧽 Removes outer border
          autoheight: true,
          // "& .MuiDataGrid-root": {
          //   minHeight: 1000, // Tetapkan ketinggian minimum di sini
          // },
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

      {/* Conditionally render message when no data */}
      {itemList.length === 0 && (
        <Typography align="center" sx={{ mt: 2, color: "white", fontSize: "1.2rem" }}>
          Tidak ada rekod dijumpai
        </Typography>
      )}

      {isView ? null : (
        <>
          <DeleteItemModal
            open={isUser ? false : deleteModalOpen} // Disable edit modal for user hardcodely
            handleClose={handleCloseDeleteModal}
            handleConfirm={handleConfirmDelete}
            itemID={selectedItemID}
            rfidStatusUpdatorID={rfidStatusUpdatorID}
          />
          <EditItemModal
            open={isUser ? false : itemModal}
            handleClose={handleCloseEditModal}
            item={itemToEdit || item}
            setItem={setItem}
            updateItem={handleUpdateItem}
          />
          {selectedItem && (
            <ViewItemDialog
              open={viewDialogOpen}
              handleClose={handleCloseViewDialog}
              item={selectedItem}
            />
          )}
          <ItemStatusChangeModal
            open={isUser ? false : statusModalOpen}
            handleClose={handleCloseStatusModal}
            currentStatus={currentStatus}
            handleConfirm={handleConfirmStatusChange}
          />
        </>
      )}
    </Box>
  );
};

export default ItemTableWidget;
