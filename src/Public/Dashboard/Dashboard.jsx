import CardComponent from "../../Component/card/CardComponent";
import active from "../../img/icon/active.png";
import activeLocation from "../../img/icon/activeLocation.png";
import checkinItems from "../../img/icon/checkinItems.png";
import move from "../../img/icon/move.png";
import { Grid } from "@mui/material";
import { HorizontalBars } from "../../Component/card/Widget/HorizontalBars";
import { SimpleLineChart } from "../../Component/card/Widget/SimpleLineChart";
import ItemTableWidget from "../../Item/Widget/ItemTableWidget";
import { useState, useEffect } from "react";
import { database } from "../../Backend/firebase/firebase-config";
import { ref, onValue, off, get, remove, set } from "firebase/database";
import { format, subDays } from "date-fns";

const Dashboard = () => {
  //state
  const [item, setItem] = useState({
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
  const [itemList, setItemList] = useState([]);
  const [dates, setDates] = useState([]);
  const [dailyMovement, setDailyMovement] = useState([]);

  // hooks
  const fetchDailyMovementData = async () => {
    const dailyMovementRef = ref(database, "Dashboard/DailyMovement");

    try {
      const snapshot = await get(dailyMovementRef);
      const data = snapshot.exists() ? snapshot.val() : {};

      // Convert the data into the required format for BarChart
      const processedData = Object.keys(data).map((location) => ({
        location,
        count: data[location],
      }));

      setDailyMovement(processedData);
    } catch (error) {
      console.error("Error fetching daily movement data: ", error);
    }
  };

  // Check-In Items List
  useEffect(() => {
    //get all items
    const itemRef = ref(database, "Items");

    const updateItemList = (snapshot) => {
      if (snapshot.exists()) {
        const item = Object.values(snapshot.val());
        // Get today's date (formatted as 'd-m-yyyy')
        const today = new Date();
        const formattedToday = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

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
          .filter(item => {
            const itemDate = parseDate(item.createdDate);
            if (!itemDate) return false; // If the date couldn't be parsed, exclude the item
            const formattedItemDate = `${itemDate.getDate()}-${itemDate.getMonth() + 1}-${itemDate.getFullYear()}`;
            return formattedItemDate === formattedToday; // Keep only items with today's date
          })
          .map((doc, index) => ({
            ...doc,         // Spread the existing data
            bil: index + 1, // Add the index based on the sorted order
          }));
        setItemList(sortedItem);
      } else {
        setItemList([]);
      }
    };

    onValue(itemRef, updateItemList);

    return () => {
      off(itemRef, updateItemList);
    };
  }, []);

  // Weekly Movement
  useEffect(() => {
    const weeklyMovementRef = ref(database, "Dashboard/WeeklyMovement");
    const dailyMovementRef = ref(database, "Dashboard/DailyMovement");
    const lastUpdateRef = ref(database, "Dashboard/lastUpdate");
    const today = new Date();
    const todayStr = format(today, "d-M-yyyy");
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      format(subDays(today, i), "d-M-yyyy")
    );

    const parseDate = (dateString) => {
      const [day, month, year] = dateString.split("-");
      return new Date(year, month - 1, day);
    };

    const fetchData = async () => {
      const snapshot = await get(weeklyMovementRef);
      const lastUpdateSnapshot = await get(lastUpdateRef);

      const data = snapshot.exists() ? snapshot.val() : {};
      const lastUpdate = lastUpdateSnapshot.val();

      // Map to hold the date values, initialize with 0 for the last 7 days
      const validEntriesMap = last7Days.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
      }, {});

      // Populate the map with existing data
      for (const date in data) {
        if (validEntriesMap.hasOwnProperty(date)) {
          validEntriesMap[date] = data[date];
        }
      }

      // Check if lastUpdate is today
      if (lastUpdate !== todayStr) {
        // Update lastUpdate to today
        await set(lastUpdateRef, todayStr);
        await set(dailyMovementRef, {
          RoomA : 0,
          RoomB : 0,
        });
        // Update the database with the last 7 days' data, including any missing dates set to 0
        for (const date of last7Days) {
          await set(
            ref(database, `Dashboard/WeeklyMovement/${date}`),
            validEntriesMap[date]
          );
        }

        // Remove entries older than 7 days
        for (const date in data) {
          if (!last7Days.includes(date)) {
            await remove(ref(database, `Dashboard/WeeklyMovement/${date}`));
          }
        }
      }

      // Prepare the sorted dates for display
      setDates(
        last7Days.map((date) => ({
          date,
          value: validEntriesMap[date],
        }))
      );
    };

    fetchData();
  }, []);

  // Daily Movement
  useEffect(() => {
    fetchDailyMovementData();
  }, []);

  // Find the key with the highest count
  const findKeyWithHighestCount = () => {
    let highestCount = 0;
    let keyWithHighestCount = "";

    for (const entry of dailyMovement) {
      if (entry.count > highestCount) {
        highestCount = entry.count;
        keyWithHighestCount = entry.location;
      }
    }

    return keyWithHighestCount;
  };

  const keyWithHighestCount = findKeyWithHighestCount();

  return (
    <div
      style={{
        marginLeft: "3rem",
        marginRight: "3rem",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <br></br>
      <br></br>
      <Grid container spacing={2} columns={12}>
        <Grid item xs={12} lg={12} display={"flex"} justifyContent={"center"}>
          <CardComponent
            title={"Item Didaftar"}
            value={itemList.length}
            icon={checkinItems}
            PopUpComponent={ItemTableWidget}
            popUpProps={{ item, itemList, setItem, isView: true }}
          />
        </Grid>
        {/* <Grid item xs={12} lg={6} display={"flex"} justifyContent={"center"}>
          <CardComponent title={"Most Active Items"} value={""} icon={active} />
        </Grid> */}
        <Grid item xs={12} lg={6} display={"flex"} justifyContent={"center"}>
          <CardComponent
            title={"Pergerakan Mingguan"}
            value={dates.reduce((acc, dateObj) => acc + dateObj.value, 0)}
            icon={move}
            PopUpComponent={SimpleLineChart}
            popUpProps={{ dates }}
          />
        </Grid>
        <Grid item xs={12} lg={6} display={"flex"} justifyContent={"center"}>
          <CardComponent
            title={"Lokasi Paling Aktif"}
            value={keyWithHighestCount}
            icon={activeLocation}
            PopUpComponent={HorizontalBars}
            popUpProps={{ dailyMovement }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
