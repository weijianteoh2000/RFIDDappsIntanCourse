#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>
#include "Firebase_Arduino_WiFiNINA.h"
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <ArduinoJson.h>
#include <ArduinoHttpClient.h>
#include <WiFiNINA.h>

// Define pins for the RFID reader
#define SS_PIN 10
#define RST_PIN 7

// The Correct One...


// Firebase configuration
// #define DATABASE_URL "uno-wifi-r-2-a22cd-default-rtdb.asia-southeast1.firebasedatabase.app"
// #define DATABASE_SECRET "8W6a7PrBp5yjelnImr3OUBD4VHCv1PSw4r0OmIwt"
#define DATABASE_URL "azure-rfid-dapp-default-rtdb.asia-southeast1.firebasedatabase.app"
#define DATABASE_SECRET "beij42LVt6aucLXOkUHjc3ftAQcPzMpysTIkHdsk"
#define WIFI_SSID "pandora"
#define WIFI_PASSWORD "pandora05"
#define ARDUINOID "PESERTAID-001"

// Create instances for the RFID reader, LCD, and NTP client
MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

LiquidCrystal_I2C lcd(0x27, 16, 2);  // Set the LCD address to 0x27 for a 16 chars and 2 line display

FirebaseData fbdo;
// WiFiUDP ntpUDP;
// NTPClient timeClient(ntpUDP, "pool.ntp.org", 28800, 60000);  // UTC+8 for Malaysia

int blockNum = 8;
byte readBlockData[18];

MFRC522::StatusCode status;
bool cardPresent = false;
bool secondScan = false;
String storedID = "";
String prevStoredID = "";
unsigned long lastCardDetectedTime = 0;
const unsigned int scanDurationInterval = 6000;  // scan second time within 2 seconds
// unsigned long epochTime = 0;
const char serverName[] = "intan-rfid-server.azurewebsites.net";  // server name
int port = 80;


WiFiClient wifiClient;
HttpClient client = HttpClient(wifiClient, serverName, port);

struct Date {
  int day;
  int month;
  int year;
};

void lcdPrint(String msg, int d) {
  lcd.clear();
  lcd.print(msg);
  delay(d);
}

void lcdPrint(String msg1, String msg2, int d) {
  lcd.clear();
  lcd.print(msg1);
  lcd.setCursor(0, 1);
  lcd.print(msg2);
  delay(d);
}

void connectWiFi() {
  int status = WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (status != WL_CONNECTED) {
    lcdPrint("Connecting Wifi", "...", 1000);
    status = WiFi.status();
  }
  // lcdPrint("Wifi Connected", "to" + WiFi.localIP(), 3000);
  lcdPrint("Wifi connected", 2000);
}



void mrfHalt() {
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  memset(readBlockData, 0, sizeof(readBlockData));
}

void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  SPI.begin();
  mfrc522.PCD_Init();
  connectWiFi();

  Firebase.begin(DATABASE_URL, DATABASE_SECRET, WIFI_SSID, WIFI_PASSWORD);
  Firebase.reconnectWiFi(true);

  // Initialize NTP client
  // timeClient.begin();

  // Print a welcome message on the LCD
  lcdPrint("Scan your card ", 10);
}


void loop() {
  // timeClient.update();  // Update the time from the NTP server
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    lastCardDetectedTime = millis();  // Update the last detected time

    if (!cardPresent) {
      cardPresent = true;
      lcdPrint("New card present", 500);
      if (ReadDataFromBlock(blockNum, readBlockData)) {
        storedID = "";
        for (int j = 0; j < 10; j++) {
          storedID += char(readBlockData[j]);
        }

        storedID.trim();
        prevStoredID = storedID;
        lcdPrint("Stored ID:", prevStoredID, 1000);
        //lcdPrint("Scan again for","Updt / Del data",2000);
        lcd.clear();
        lcd.print("Scan again for");
        lcd.setCursor(0, 1);
        lcd.print("Updt / Del data");
        // Halt the card and stop encryption
        mrfHalt();
      } else {
        defaultState();
      }
    } else {
      // Serial.println("Reading from Data Block...");
      // Get the stored ID from the card
      if (ReadDataFromBlock(blockNum, readBlockData)) {
        storedID = "";
        for (int j = 0; j < 10; j++) {
          storedID += char(readBlockData[j]);
        }
        storedID.trim();
        if (prevStoredID == "" || storedID == prevStoredID) {
          secondScan = true;
        }
      } else {
        defaultState();
      }
    }
  }

  if (cardPresent && secondScan) {
    prevStoredID = "";
    cardPresent = secondScan = false;
    if (ReadDataFromBlock(blockNum, readBlockData)) {
      updateDeleteCardData(storedID);
      defaultState();
    } else {
      defaultState();
    }
    cardPresent = false;
    secondScan = false;
  }


  if (cardPresent && !secondScan && (millis() - lastCardDetectedTime) > scanDurationInterval) {
    cardPresent = false;

    if (storedID != "") {
      lcdPrint("Connecting to", "Firebase", 0);
      switchLocation(storedID);
    } else {
      lcdPrint("Item ID ", "not found ", 0);
    }
    defaultState();
  }
}

void defaultState() {
  // Halt the card and stop encryption
  mrfHalt();
  delay(2000);  // Ensure a reasonable delay to prevent too fast looping
  lcdPrint("Scan your card", 10);
  // lcd.clear();
  // lcd.setCursor(0, 0);
  // lcd.print("Scan Your Card");
}

void updateLocationBlock(String contractAddress, String newLocation) {
  const char* contentType = "application/x-www-form-urlencoded";
  String postData = "contractAddress=" + contractAddress + "&newLocation=" + newLocation;

  client.beginRequest();
  client.post("/update-location");
  // client.sendHeader("Host", serverName);
  client.sendHeader("bypass-tunnel-reminder", 1234);
  client.sendHeader("Content-Type", contentType);
  client.sendHeader("Content-Length", String(postData.length()));
  client.beginBody();
  client.print(postData);
  client.endRequest();

  blockchainResponse();
}

void updateRFIDStatusBlock(String contractAddress, String newStatus) {
  const char* contentType = "application/x-www-form-urlencoded";
  String postData = "contractAddress=" + contractAddress + "&newStatus=" + newStatus;

  client.beginRequest();
  client.post("/change-status");
  client.sendHeader("bypass-tunnel-reminder", 1234);
  client.sendHeader("Content-Type", contentType);
  client.sendHeader("Content-Length", String(postData.length()));
  client.beginBody();
  client.print(postData);
  client.endRequest();

  blockchainResponse();
}

String getDate(String includeTime) {
  const char* contentType = "application/x-www-form-urlencoded";
  String postData = "isIncludeTime=" + includeTime;
  client.beginRequest();
  client.post("/get-date");
  client.sendHeader("bypass-tunnel-reminder", 1234);
  client.sendHeader("Content-Type", contentType);
  client.sendHeader("Content-Length", String(postData.length()));
  client.beginBody();
  client.print(postData);
  client.endRequest();

  String response = client.responseBody();  // Get the response data
  Serial.print("Response: ");
  Serial.println(response);

  // Create a JSON document to parse the response
  DynamicJsonDocument doc(1024);  // You can adjust the size (1024 is usually enough for a simple response)
  
  // Parse the JSON response
  DeserializationError error = deserializeJson(doc, response);
  const char* time = doc["time"];
  return String(time);
}

void blockchainResponse() {
  delay(2000);
  // read the status code and body of the response
  int statusCode = client.responseStatusCode();
  // Serial.print("Status code: ");
  // Serial.println(statusCode);
  // String response = client.responseBody(); //check for respond data
  // Serial.print("Response: ");
  // Serial.println(response);
  if (statusCode != 200) {
    lcdPrint("Blockchain error", 2000);
  } else {
    lcdPrint("Blockchain", "success", 2000);
  }
}

bool ReadDataFromBlock(int blockNum, byte readBlockData[]) {
  byte bufferLen = 18;
  // Authenticating the desired data block for Read access using Key A
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));

  if (status != MFRC522::STATUS_OK) {
    lcdPrint("Auth failed", 500);
    cardPresent = false;
    return false;
  } else {
    // Reading data from the Block
    status = mfrc522.MIFARE_Read(blockNum, readBlockData, &bufferLen);
    if (status != MFRC522::STATUS_OK) {
      lcdPrint("Reading failed", 500);
      cardPresent = false;
      return false;
    } else {
      lcdPrint("Reading success", 2000);
      return true;
    }
  }
}

void WriteDataToBlock(int blockNum, byte blockData[]) {
  // Authenticating the desired data block for write access using Key A
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    // Serial.print("Authentication failed for Write: ");
    // Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    // Serial.println("Authentication success");
  }

  // Writing data to the block
  status = mfrc522.MIFARE_Write(blockNum, blockData, 16);
  if (status != MFRC522::STATUS_OK) {
    // Serial.print("Writing to Block failed: ");
    // Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    // Serial.println("Data was written into Block successfully");
  }
}

String getPendingItemID() {
  // String path = "/Items";
  char path[30];
  snprintf(path, sizeof(path), "/Pending/%s", ARDUINOID);
  //if (Firebase.getJSON(fbdo, path)) {
  if (Firebase.getArray(fbdo, path)) {
    // String jsonStr = fbdo.jsonData();
    String jsonStr = fbdo.arrayData();
    int startIdx = 0;
    // Serial.println("start check");
    // Serial.println(jsonStr);
    // Serial.println("end check");
    String lastKey = "";
    int count = 0;
    while (startIdx != -1) {
      startIdx = jsonStr.indexOf("\"", startIdx + 1);
      int endIdx = jsonStr.indexOf("\"", startIdx + 1);
      if (startIdx == -1 || endIdx == -1) break;

      String key = jsonStr.substring(startIdx + 1, endIdx);
      // Serial.print("CurrentKey: ");
      // Serial.println(key);
      count += 1;
      String statusPath = "/Items/" + key + "/RFIDStatus";
      if (Firebase.getString(fbdo, statusPath)) {
        String status = fbdo.stringData();
        if (status == "Pending") {
          lastKey = key;
        }
      } else {
        lcdPrint("GetStrError1", 1000);
      }
      // else {
      // Serial.print("Error getting status: ");
      // Serial.println(fbdo.errorReason());
      // }
      startIdx = jsonStr.indexOf(",", endIdx + 1);
    }
    if (count == 1) {
      jsonStr.replace("\"" + lastKey + "\"", "");
    } else {
      jsonStr.replace(",\"" + lastKey + "\"", "");
    }
    if (Firebase.setArray(fbdo, path, jsonStr)) {
      // Serial.println("Set Array Success");
    } else {
      lcdPrint("Error Delete", "Pending Item", 1000);
      return "Error";
    }
    return lastKey;
  } else {
    lcdPrint("NoPendingItem", "Found", 1000);
    return "Error";
  }
  return "";
}

void updateDeleteCardData(String storedID) {
  // Authenticate and read data from the specified block
  // Serial.println("Reading from Data Block...");
  ReadDataFromBlock(blockNum, readBlockData);
  // Serial.println("**Card Detected**");
  // Get the stored ID from the card
  storedID = "";
  for (int j = 0; j < 10; j++) {
    storedID += char(readBlockData[j]);
  }
  storedID.trim();
  lcdPrint("Connecting to", "Firebase", 0);
  if (storedID == "") {
    // Serial.println("Stored ID is empty, checking for pending items...");
    // Serial.print("Stored ID: ");
    // Serial.println(storedID);
    String pendingID = getPendingItemID();

    // Serial.println(pendingID);
    if (pendingID == "Error") {
      // Serial.println("Connection Error");
      lcdPrint("Back to normal", 500);
      return;
    } else if (pendingID != "") {
      // Serial.print("Pending Item ID: ");

      // Write the pending ID to the card and update Firebase status
      byte blockData[16];
      pendingID.getBytes(blockData, 16);
      WriteDataToBlock(blockNum, blockData);

      String statusPath = "/Items/" + pendingID + "/RFIDStatus";
      // char statusPath[50];
      // printf(statusPath, "/Items/%s/RFIDStatus", pendingID);
      String lastUpdatedByPath = "/Items/" + pendingID + "/lastUpdatedBy";
      String lastUpdatedTimePath = "/Items/" + pendingID + "/lastUpdatedTime";
      String currentDateTime = getCurrentDateTime(true);
      String contractAddress = "";
      if (Firebase.getString(fbdo, "/Items/" + pendingID + "/contractAddress")) {
        contractAddress = fbdo.stringData();
      } else {
        // Serial.print("Error to get contract address");
        // Serial.println(fbdo.errorReason());
        lcdPrint("FailGetAddress", 2000);
        return;
      }
      if (Firebase.setString(fbdo, statusPath, "Available") && Firebase.setString(fbdo, lastUpdatedByPath, "Arduino") && Firebase.setString(fbdo, lastUpdatedTimePath, currentDateTime)) {
        updateRFIDStatusBlock(contractAddress, "Available");
        // Serial.println("Item status updated to Available.");
        lcdPrint("ID: " + pendingID, "written to card", 2000);
        lcdPrint("Status changed", "to available", 2000);
      } else {
        // Serial.print("Error updating status: ");
        // Serial.println(fbdo.errorReason());
        lcdPrint("SetStrError1", 0);
      }
    } else {
      // Serial.println("No pending items found.");
      lcdPrint("No pending items", "found....", 250);
      // lcd.clear();
      // lcd.setCursor(0, 0);
      // lcd.print(getPendingItemID());
    }
  } else {
    // Serial.println("Stored ID found, marking item as Unavailable...");

    // Update Firebase status
    String statusPath = "/Items/" + storedID + "/RFIDStatus";
    String updatorPath = "/Items/" + storedID + "/rfidStatusUpdatorID";
    String lastUpdatedByPath = "/Items/" + storedID + "/lastUpdatedBy";
    String lastUpdatedTimePath = "/Items/" + storedID + "/lastUpdatedTime";
    String currentDateTime = getCurrentDateTime(true);
    String contractAddress = "";
    if (Firebase.getString(fbdo, "/Items/" + storedID + "/contractAddress")) {
      contractAddress = fbdo.stringData();
    } else {
      // Serial.print("Error to get contract address");
      // Serial.println(fbdo.errorReason());
      byte clearData[16] = { 0 };
      WriteDataToBlock(blockNum, clearData);
      lcdPrint("InvalidItemID", "ItemIDRemoved", 1000);
      return;
    }
    if (Firebase.setString(fbdo, statusPath, "Unavailable") && Firebase.setString(fbdo, updatorPath, "-") && Firebase.setString(fbdo, lastUpdatedByPath, "Arduino") && Firebase.setString(fbdo, lastUpdatedTimePath, currentDateTime)) {
      // Clear the ID from the card
      byte clearData[16] = { 0 };
      WriteDataToBlock(blockNum, clearData);

      updateRFIDStatusBlock(contractAddress, "Unavailable");
      // Serial.println("Item status updated to Unavailable.");
      lcdPrint("ID: " + storedID, "is removed ", 2000);
      lcdPrint("Status changed", "to unavailable", 2000);
    } else {
      // Serial.print("Error updating status: ");
      // Serial.println(fbdo.errorReason());
      lcdPrint("SetStrError2", 0);
    }
  }
}

void switchLocation(String storedID) {
  // Get current location
  String statusPath = "/Items/" + storedID + "/location";
  String addressPath = "/Items/" + storedID + "/contractAddress";
  if (Firebase.getString(fbdo, addressPath)) {
    String contractAddress = fbdo.stringData();

    if (Firebase.getString(fbdo, statusPath)) {
      String location = fbdo.stringData();
      if (location == "Room A") {
        updateLocationToFirebase(storedID, "Room B");
        updateLocationBlock(contractAddress, "Room B");
      } else if (location == "Room B") {
        updateLocationToFirebase(storedID, "Room A");
        updateLocationBlock(contractAddress, "Room A");
      } else {
        // Serial.print("Error to get location");
        lcdPrint("GetStrError5", 1000);
      }
    } else {
      // Serial.print("Error getting status: ");
      lcdPrint("GetStrError4", 1000);
    }
  } else {
    // Serial.print("Error to get contract address");
    lcdPrint("Unvalid item ID", 0);
    // Serial.println(fbdo.errorReason());
  }
}

void updateLocationToFirebase(String storedID, String location) {
  String locationPath = "/Items/" + storedID + "/location";
  String lastUpdatedByPath = "/Items/" + storedID + "/lastUpdatedBy";
  String lastUpdatedTimePath = "/Items/" + storedID + "/lastUpdatedTime";
  String currentDateTime = getCurrentDateTime(true);

  // Update Firebase location
  if (Firebase.setString(fbdo, locationPath, location) && Firebase.setString(fbdo, lastUpdatedByPath, "Arduino") && Firebase.setString(fbdo, lastUpdatedTimePath, currentDateTime)) {
    updateDashboard(storedID, location == "Room A");
    // Serial.println("Item location updated to " + location);
    lcdPrint("Location changed", "to " + location, 2000);
  } else {
    // Serial.println(fbdo.errorReason());
    //Serial.print("location:" + location );
    //Serial.print("currentDateTime:" + currentDateTime );
    lcdPrint("Error updating", "location", 2000);
  }
}

void updateDashboard(String storedID, bool isRoomA) {
  String path = "/Dashboard/lastUpdate";
  String lastUpdate = "";
  if (Firebase.getString(fbdo, path)) {
    lastUpdate = fbdo.stringData();
  } else {
    // Serial.print("Failed to get last update date from Firebase: ");
    // Serial.println(fbdo.errorReason());
    lcdPrint("GetStrError6", 1000);
    return;
  }

  // Format the date into 'd-m-yyyy'
  String formattedDate = getCurrentDateTime(false);
  if (lastUpdate == formattedDate) {
    updateDashboardForCurrDay(formattedDate, isRoomA);
  } else {
    if (Firebase.setString(fbdo, path, formattedDate)) {
      // Serial.println("Last update date updated successfully.");
    } else {
      // Serial.print("Failed to get last update date from Firebase: ");
      // Serial.println(fbdo.errorReason());
      lcdPrint("SetStrError4", 1000);
      return;
    }
    path = "/Dashboard/WeeklyMovement";
    // Remove oldest date and update latest date
    updateDashboardForNewDay(path, formattedDate, isRoomA);
  }
}

Date parseDate(String dateStr) {
  Date date;
  int firstDash = dateStr.indexOf('-');
  int lastDash = dateStr.lastIndexOf('-');

  date.day = dateStr.substring(0, firstDash).toInt();
  date.month = dateStr.substring(firstDash + 1, lastDash).toInt();
  date.year = dateStr.substring(lastDash + 1).toInt();

  return date;
}

bool isOlderDate(Date date1, Date date2) {
  if (date1.year < date2.year) return true;
  if (date1.year > date2.year) return false;

  if (date1.month < date2.month) return true;
  if (date1.month > date2.month) return false;

  return date1.day < date2.day;
}

void updateDashboardForNewDay(String path, String currentDate, bool isRoomA) {
  if (Firebase.get(fbdo, path)) {
    String oldestKey = "";
    Date oldestDate;
    if (fbdo.dataType() == "json") {  // Ensure that the data type is JSON
      String jsonString = fbdo.jsonData();
      int len = jsonString.length();
      int i = 0;
      // Get the key (child node name)
      String key = "";
      // Get the value of the child node
      String value = "";
      while (i < len) {
        // Find the start of a key
        int keyStart = jsonString.indexOf('"', i);
        if (keyStart == -1) break;
        int keyEnd = jsonString.indexOf('"', keyStart + 1);
        String key = jsonString.substring(keyStart + 1, keyEnd);

        // Find the start of a value
        int valueStart = jsonString.indexOf(':', keyEnd) + 1;
        int valueEnd = jsonString.indexOf(',', valueStart);
        if (valueEnd == -1) {
          valueEnd = jsonString.indexOf('}', valueStart);
        }
        String value = jsonString.substring(valueStart, valueEnd);

        Date currentDate = parseDate(key);
        if (oldestKey == "" || isOlderDate(currentDate, oldestDate)) {
          oldestKey = key;
          oldestDate = currentDate;
        }
        // Move to the next key-value pair
        i = valueEnd + 1;
      }
    }
    // else {
    // Serial.println("No JSON data found at the specified path.");
    // }

    // Remove the oldest date key
    if (Firebase.deleteNode(fbdo, path + "/" + oldestKey)) {
      // Serial.println("Weekly oldestDate removed successfully.");
      // Serial.println("oldestDate: " + oldestKey);
    } else {
      // Serial.print("Failed to remove Weekly oldestDate: ");
      // Serial.println(fbdo.errorReason());
      return;
    }


    if (Firebase.setInt(fbdo, path + "/" + currentDate, 1)) {
      // Serial.println("New date key added successfully.");
    } else {
      // Serial.print("Failed to add new date key: ");
      // Serial.println(fbdo.errorReason());
      return;
    }

    if (isRoomA) {
      updateDailyMovement("RoomA", 1);
      updateDailyMovement("RoomB", 0);
    } else {
      updateDailyMovement("RoomA", 0);
      updateDailyMovement("RoomB", 1);
    }
  }
  // else {
  // Serial.print("Failed to get data from Firebase: ");
  // Serial.println(fbdo.errorReason());
  // }
}

void updateDailyMovement(String room, int newValue) {
  // Serial.println("Dashboard for DailyMovement");
  if (Firebase.setInt(fbdo, "/Dashboard/DailyMovement/" + room, newValue)) {
    // Serial.println("New date key added successfully.");
  } else {
    // Serial.print("Failed to add new date key: ");
    // Serial.println(fbdo.errorReason());
    return;
  }
}

void updateDashboardForCurrDay(String currDate, bool isRoomA) {
  String dataPath = "Dashboard/WeeklyMovement/" + currDate;
  incrementValue(dataPath);
  if (isRoomA) {
    dataPath = "/Dashboard/DailyMovement/RoomA";
    incrementValue(dataPath);
  } else {
    dataPath = "/Dashboard/DailyMovement/RoomB";
    incrementValue(dataPath);
  }
}

void incrementValue(String dataPath) {
  int newValue = 0;
  int currentValue = 0;
  // Get the current value from Firebase

  if (Firebase.getInt(fbdo, dataPath)) {
    currentValue = fbdo.intData();
    // Serial.print("Current value: ");
    // Serial.println(currentValue);
  } else {
    // Serial.print("Failed to get data from Firebase: ");
    // Serial.println(fbdo.errorReason());
    return;
  }
  // Increment the value
  newValue = currentValue + 1;

  // Update the new value back to Firebase
  if (Firebase.setInt(fbdo, dataPath, newValue)) {
    // Serial.println("Value updated successfully.");
  } else {
    // Serial.print("Failed to update value: ");
    // Serial.println(fbdo.errorReason());
    return;
  }
}
// Check if a year is a leap year
bool isLeapYear(int year) {
  return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

String getCurrentDateTime(bool includeTime) {
  String date = "";
  if (!includeTime) {
    date = getDate("false");
  } else {
    date = getDate("true");
  }
  return date;
}