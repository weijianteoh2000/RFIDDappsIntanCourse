import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { ref, onValue, off, remove, set, get } from "firebase/database";
import { database } from "../Backend/firebase/firebase-config";
import { customAlphabet } from "nanoid";
import ItemTableWidget from "./Widget/ItemTableWidget";
import AddItemModal from "./Widget/AddItemModal";
import { format, subDays } from "date-fns";
import {
  deployContract as deployBlockchainContract,
  updateItem as blockchainUpdateItem,
  changeRFIDStatus as blockchainChangeRFIDStatus,
  deleteItem as blockchainDeleteItem,
  upgradeContract,
} from "../Backend/privateNetwork/contract";
import { toast } from "react-toastify";
import { useLoading } from "../Context/LoadingContext";
import CustomToast from "../Component/customtoast/CustomToast";

const ItemPage = () => {
  const userName = sessionStorage.getItem("name");
  const myAlphabet = "0123456789";
  const nanoid = customAlphabet(myAlphabet, 10);
  const [currentItemList, setCurrentItemList] = useState([]);
  const [deletedItemList, setDeletedItemList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [item, setItem] = useState({
    itemID: "",
    name: "",
    createdDate: getCurrentDateTime(),
    location: "",
    RFIDStatus: "",
    blockchainExplorer: "",
    createdBy: "",
    createdByID: "",
    createdTime: "",
    lastUpdatedBy: "",
    lastUpdatedTime: "",
    contractAddress: "",
    rfidStatusUpdatorID: "-",
  });
  const [pendingItems, setPendingItems] = useState([]);
  const [listType, setListType] = useState("current"); // State for the list type
  const [tableKey, setTableKey] = useState(Date.now()); // State for forcing re-render of table
  const { showLoader, hideLoader } = useLoading();
  // Check if the user is an admin
  const isUser = JSON.parse(sessionStorage.getItem("user")).role === "USER";

  function getCurrentDateTime() {
    const now = new Date();

    // Get individual components
    const day = String(now.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Construct the formatted date string
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  const reformatDateString = (dateString) => {
    const [datePart, timePart] = dateString.split(", ");
    const [month, day, year] = datePart.split("/");

    // Reformat to d/m/yyyy
    const formattedDate = `${day}/${month}/${year}`;

    // Return the reformatted string
    return `${formattedDate}, ${timePart}`;
  };

  const addItem = async () => {
    showLoader();
    const id = nanoid();
    try {
      console.log("Item Created", item);
      const blockchainInfo = await deployBlockchainContract(
        id,
        item.name,
        item.location,
        userName,
        item.RFIDStatus ? item.RFIDStatus : "Unavailable"
      );
      console.log("Blockchain transaction: ", blockchainInfo.transactionId);
      console.log("Contract address: ", blockchainInfo.contractAddress);
      const itemRef = ref(database, `Items/${id}`);
      const lastUpdateRef = ref(database, "Dashboard/lastUpdate");
      const weeklyMovementRef = ref(database, "Dashboard/WeeklyMovement");
      const dailyMovementRef = ref(database, "Dashboard/DailyMovement");

      const today = new Date();
      const todayStr = format(today, "d-M-yyyy");
      const newItem = {
        contractAddress: blockchainInfo.contractAddress,
        itemID: id,
        name: item.name,
        location: item.location,
        createdDate: getCurrentDateTime(),
        RFIDStatus: "Unavailable",
        blockchainExplorer: blockchainInfo.transactionId,
        createdBy: userName,
        createdByID: sessionStorage.getItem("userID"),
        createdTime: reformatDateString(new Date().toLocaleString()),
        lastUpdatedBy: item.lastUpdatedBy,
        lastUpdatedTime: reformatDateString(new Date().toLocaleString()),
        rfidStatusUpdatorID: "-",
      };

      await set(itemRef, newItem)
        .then(() => {
          console.log("Item added to Firebase with Blockchain integration");
          setTableKey(Date.now()); // Force re-render of table
        })
        .catch((error) => {
          console.error("Error adding item: ", error);
        });

      const snapshot = await get(lastUpdateRef);
      const lastUpdate = snapshot.exists() ? snapshot.val() : null;
      await set(lastUpdateRef, todayStr);

      const weeklySnapshot = await get(weeklyMovementRef);
      const weeklyData = weeklySnapshot.exists() ? weeklySnapshot.val() : {};

      // Increment today's value or initialize it to 1 if not present
      const todayValue = weeklyData[todayStr] ? weeklyData[todayStr] + 1 : 1;
      weeklyData[todayStr] = todayValue;

      // Remove entries older than 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) =>
        format(subDays(today, i), "d-M-yyyy")
      );
      Object.keys(weeklyData).forEach((date) => {
        if (!last7Days.includes(date)) {
          delete weeklyData[date];
        }
      });

      // Update weekly movement data in Firebase
      await set(weeklyMovementRef, weeklyData);

      const dailySnapshot = await get(dailyMovementRef);
      const dailyData = dailySnapshot.exists() ? dailySnapshot.val() : {};

      if (lastUpdate !== todayStr) {
        // Reset the daily movement data if it is a new day
        Object.keys(dailyData).forEach((location) => {
          dailyData[location] = 0;
        });
      }

      // Increment the value for the item's location or initialize it to 1 if not present
      const itemLocation = newItem.location == "Room A" ? "RoomA" : "RoomB";
      dailyData[itemLocation] = dailyData[itemLocation]
        ? dailyData[itemLocation] + 1
        : 1;

      // Update daily movement data in Firebase
      await set(dailyMovementRef, dailyData);

      // console.log("Item added successfully");
      // setTableKey(Date.now()); // Force re-render of table
      toast(<CustomToast message="Anda berjaya mendaftar item." />);
    } catch (error) {
      toast(<CustomToast message="Gagal menambah item." />);
      console.error("Error adding item: ", error);
    }
    hideLoader();
  };

  const updateItem = async () => {
    showLoader();
    const itemRef = ref(database, `Items/${item.itemID}`);
    const getPendingItemRefForUser = ref(database, `Pending/${item.rfidStatusUpdatorID}`);
    const lastUpdateRef = ref(database, "Dashboard/lastUpdate");
    const weeklyMovementRef = ref(database, "Dashboard/WeeklyMovement");
    const dailyMovementRef = ref(database, "Dashboard/DailyMovement");
    const today = new Date();
    const todayStr = format(today, "d-M-yyyy");

    try {
      // Get current item data to check the old location
      const itemSnapshot = await get(itemRef);
      console.log("Item Snapshot: ", itemSnapshot.val());
      if (itemSnapshot.exists()) {
        const oldItem = itemSnapshot.exists() ? itemSnapshot.val() : null;
        const oldLocation = oldItem ? oldItem.location == "Room A" ? "RoomA" : "RoomB" : null;

        // Update item's last updated time and new location
        item.lastUpdatedTime = reformatDateString(today.toLocaleString());
        item.lastUpdatedBy = userName;
        const newLocation = item.location == "Room A" ? "RoomA" : "RoomB";
        var isChangeRoom = oldLocation != newLocation;
        if (item.name !== oldItem.name || item.location !== oldItem.location) {
          const txAddress = await blockchainUpdateItem(
            oldItem.contractAddress,
            item.name,
            item.location,
            item.lastUpdatedBy
          );
          item.blockchainExplorer = txAddress;
        }

        if (item.RFIDStatus != "Pending") {
          item.rfidStatusUpdatorID = "-";
        }

        // Update the item in the database
        await set(itemRef, item);

        const snapshot = await get(lastUpdateRef);
        const lastUpdate = snapshot.exists() ? snapshot.val() : null;
        // Update lastUpdate in the database
        await set(lastUpdateRef, todayStr);

        // Get current weekly movement data
        const weeklyMovementSnapshot = await get(weeklyMovementRef);
        const weeklyMovementData = weeklyMovementSnapshot.exists()
          ? weeklyMovementSnapshot.val()
          : {};
        var todayWeeklyValue = 0;
        console.log("Last Update: ", lastUpdate);
        console.log("Today: ", todayStr);
        if (lastUpdate !== todayStr) {
          const todayWeeklyValue = weeklyMovementData[todayStr]
            ? weeklyMovementData[todayStr]
            : 0;
          weeklyMovementData[todayStr] = todayWeeklyValue;
        }
        console.log("oldLocation: ", oldLocation);
        console.log("newLocation: ", newLocation);
        if (oldLocation !== newLocation) {
          // Increment today's value or initialize it to 1 if not present
          todayWeeklyValue = weeklyMovementData[todayStr]
            ? weeklyMovementData[todayStr] + 1
            : 1;
          weeklyMovementData[todayStr] = todayWeeklyValue;
        }

        // Remove entries older than 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) =>
          format(subDays(today, i), "d-M-yyyy")
        );
        Object.keys(weeklyMovementData).forEach((date) => {
          if (!last7Days.includes(date)) {
            delete weeklyMovementData[date];
          }
        });

        // Update weekly movement data in Firebase
        await set(weeklyMovementRef, weeklyMovementData);

        // Get current daily movement data
        const dailyMovementSnapshot = await get(dailyMovementRef);
        const dailyMovementData = dailyMovementSnapshot.exists()
          ? dailyMovementSnapshot.val()
          : {};

        if (lastUpdate !== todayStr) {
          // Reset the daily movement data if it is a new day
          Object.keys(dailyMovementData).forEach((location) => {
            dailyMovementData[location] = 0;
          });
        }

        // Increment the values for new locations
        if (oldLocation !== newLocation) {
          dailyMovementData[newLocation] = dailyMovementData[newLocation]
            ? dailyMovementData[newLocation] + 1
            : 1;
        }

        // Update daily movement data in Firebase
        await set(dailyMovementRef, dailyMovementData);

        // Check setup for storing pending items
        const pendingSnapshot = await get(getPendingItemRefForUser);
        let updatedItems = pendingSnapshot.exists() ? pendingSnapshot.val() : [];
        console.log("Pending Path: ", getPendingItemRefForUser);
        // Check if the item is Unavailable
        if (item.RFIDStatus == "Pending") {
          // Check if there is data at the given path
          if (!updatedItems.includes(item.itemID)) {
            updatedItems.push(item.itemID);
            await set(getPendingItemRefForUser, updatedItems);
          }
          console.log("Item added to Firebase:", updatedItems);
        } else {
          // If the RFIDStatus is not Unavailable, check for an existing itemID
          const itemIndex = updatedItems.indexOf(item.itemID);
          updatedItems.splice(itemIndex, 1);
          await set(getPendingItemRefForUser, updatedItems);
          console.log("Pending Item deleted from Firebase:");
        }
        toast(<CustomToast message="Informasi item telah dikemaskini." />);
        //setTableKey(Date.now()); // Force re-render of table
      } else {
        toast(<CustomToast message="Item tidak wujud." />);
      }
    } catch (error) {
      console.error("Error updating item: ", error);
      toast(<CustomToast message="Gagal mengemaskini item." />);
    }
    hideLoader();
  };

  const deleteItem = async (itemID, rfidStatusUpdatorID) => {
    showLoader();
    const itemRef = ref(database, `Items/${itemID}`);
    const deletedItemRef = ref(database, `DeletedItems/${itemID}`);
    const getPendingItemRefForUser = ref(database, `Pending/${rfidStatusUpdatorID}`);
    const pendingSnapshot = await get(getPendingItemRefForUser);
    const pendingArray = pendingSnapshot.exists() ? Object.values(pendingSnapshot.val()) : [];
    console.log("Pending Array: ", pendingArray);
    console.log("itemID: ", itemID);
    console.log("rfidStatusUpdatorID", rfidStatusUpdatorID);
    try {
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const itemData = snapshot.val();
        console.log("Item Data: ", itemData);
        const txAddress = await blockchainDeleteItem(itemData.contractAddress);
        // delete the item from the pending list if the RFIDStatus is Pending
        if (itemData.RFIDStatus == "Pending") {
          const itemIndex = pendingArray.indexOf(itemID);
          if (itemIndex !== -1) {
            pendingArray.splice(itemIndex, 1);
            await set(getPendingItemRefForUser, pendingArray);
            console.log("Updated Pending Array: ", pendingArray);
          }
        }

        itemData.location = "-";
        itemData.RFIDStatus = "Deleted";
        itemData.blockchainExplorer = txAddress;
        itemData.deletedDate = getCurrentDateTime();
        await set(deletedItemRef, itemData);
        await remove(itemRef);

        toast(<CustomToast message="Anda berjaya memadam item." />);
        setTableKey(Date.now()); // Force re-render of table

      } else {
        toast(<CustomToast message="Item tidak wujud." />);
      }
    } catch (error) {
      toast(<CustomToast message="Gagal menggerakkan item." />);
      console.error("Error moving item: ", error);
    }
    hideLoader();
  };

  useEffect(() => {
    const itemRef = ref(database, "Items");
    const deletedItemRef = ref(database, "DeletedItems");

    const updateCurrentItemList = (snapshot) => {
      if (snapshot.exists()) {
        const item = Object.values(snapshot.val());
        const parseDate = (dateString) => {
          const [datePart, timePart] = dateString.split(" ");
          const [day, month, year] = datePart.split("-");
          const [hours, minutes, seconds] = timePart.split(":");

          // Check if all parts are defined
          if (!day || !month || !year || !hours || !minutes || !seconds) {
            console.error(`Invalid date format: ${dateString}`);
            return null; // Return null if parsing fails
          }

          // Create a new Date object
          return new Date(year, month - 1, day, hours, minutes, seconds); // Month is 0-indexed
        };

        const sortedItem = item
          .sort((a, b) => {
            const dateA = parseDate(a.createdDate);
            const dateB = parseDate(b.createdDate);
            // If date parsing failed, handle gracefully
            if (!dateA || !dateB) {
              console.error(`Error parsing dates: ${dateA}, ${dateB}`);
              return 0; // Keep original order if sorting fails
            }
            return dateB - dateA; // Sort in descending order
          })
          .map((doc, index) => ({
            ...doc,         // Spread the existing data
            bil: index + 1, // Add the index based on the sorted order
          }));
        setCurrentItemList(sortedItem);
      } else {
        setCurrentItemList([]);
      }
    };

    const updateDeletedItemList = (snapshot) => {
      if (snapshot.exists()) {
        var deletedItem = Object.values(snapshot.val());
        const parseDate = (dateString) => {
          const [datePart, timePart] = dateString.split(" ");
          const [day, month, year] = datePart.split("-");
          const [hours, minutes, seconds] = timePart.split(":");

          // Check if all parts are defined
          if (!day || !month || !year || !hours || !minutes || !seconds) {
            console.error(`Invalid date format: ${dateString}`);
            return null; // Return null if parsing fails
          }

          // Create a new Date object
          return new Date(year, month - 1, day, hours, minutes, seconds); // Month is 0-indexed
        };
        const sortedDeletedItem = deletedItem.sort((a, b) => {
          const dateA = parseDate(a.deletedDate);
          const dateB = parseDate(b.deletedDate);
          // If date parsing failed, handle gracefully
          if (!dateA || !dateB) {
            console.error(`Error parsing dates: ${dateA}, ${dateB}`);
            return 0; // Keep original order if sorting fails
          }

          return dateB - dateA; // Sort in descending order
        });
        setDeletedItemList(sortedDeletedItem);
      } else {
        setDeletedItemList([]);
      }
    };

    onValue(itemRef, updateCurrentItemList);
    onValue(deletedItemRef, updateDeletedItemList);

    return () => {
      off(itemRef, updateCurrentItemList);
      off(deletedItemRef, updateDeletedItemList);
    };
  }, []);

  useEffect(() => {
    if (listType === "current") {
      setItemList(currentItemList);
    } else if (listType === "deleted") {
      setItemList(deletedItemList);
    }
    //   setTableKey(Date.now()); // Force re-render of table on list type change
  }, [listType, currentItemList, deletedItemList]);

  const handleListTypeChange = (event) => {
    setListType(event.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ maxHeight: "80vh", overflow: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1.5,
          backgroundColor: "rgba(189, 189, 189, 0.8)",
          borderRadius: 1,
        }}
      >
        <Typography variant="h4" color="black" sx={{ mr: 2 }}>
          Senarai Item
        </Typography>
        <FormControl
          variant="outlined"
          size="small"
          sx={{ mr: 2, minWidth: 120 }}
        >
          <Select
            labelId="list-type-label"
            value={listType}
            onChange={handleListTypeChange}
            sx={{
              height: "40px",
              "& .MuiOutlinedInput-input": {
                padding: "10px 14px",
              },
            }}
          >
            <MenuItem value="current">Semasa</MenuItem>
            <MenuItem value="deleted">Dipadamkan</MenuItem>
          </Select>
        </FormControl>
        {isUser ? null : (
          <Box sx={{ ml: "auto" }}>
            <AddItemModal item={item} setItem={setItem} addItem={addItem} />
          </Box>
        )}
      </Box>
      <ItemTableWidget
        key={tableKey}
        item={item}
        itemList={itemList}
        listType={listType}
        setItem={setItem}
        isUser={isUser}
        deleteItem={deleteItem}
        updateItem={updateItem}
      />
    </Container>
  );
};

export default ItemPage;
