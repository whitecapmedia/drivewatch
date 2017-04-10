// TODO: Add function to log to a new sheet in the bound spreadsheet.
//var LOG_SHEET = "19V3vdIwdVQoRS-HKoTqNk60daZ_VXDMfI5KW2QFuEtw";

// Starting row to output data to:
var SAMPLE_VAR = "Nick";
var START_HEADERS_ROW = 7;
var FILE_ID_CELL = "B3";
var START_DATE_CELL = "B4";
var END_DATE_CELL = "B5";
var CLEAR_SHEET_RANGE = "A8:M";

var data = [];

//var dataSet = [];

var headersArray = ['Timestamp', 'Filename', 'File ID', 'Owner', 'Primary Event Type', 'Filetype', 'Events', 'Event Data', 'Permissions'];

function onOpen(e) {
  setLogSheet(SpreadsheetApp.getActiveSpreadsheet(), true);
  // Log Config:
  log(config);
  // Add menu to spreadsheet
  createMenu_();
  //clearSheet("Sheet1", CLEAR_SHEET_RANGE);
  
  // Create Headers
  createHeaders(headersArray, true);
  log("ON OPEN"); // Frozen headers are in new sheet if log is called BEFORE headers are created. Probably just my logic. Interesting nonetheless
   
  // Permissions are set, but we don't have much control over this:
  //setPermissions();
  
  // Use Separate config sheet to handle the triggers information:
   
  // TODO: Also, needs to override based on config sheet values.
  if (config.defaultSettings.SEND_NOTIFICATIONS == true) {
    //initTriggers();
    log("INIT TRIGGERS CALLED FROM CONFIG");
  } else {
    log("INIT TRIGGERS NOT CALLED");
  }
  
  configUI_();
  
  // Update the config sheet with their triggers:
  //updateConfigSheet();
}


/**
 * getUserEvents makes a call to AppActivities.list and outputs the
 *    data to a spreadsheet.
 */
function getUserEvents() {
  log("GET USER EVENTS RAN");
  clearSheet("Sheet1", CLEAR_SHEET_RANGE);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var fileID = sh.getRange(FILE_ID_CELL).getValue();
  log("FILE ID: " + fileID);
  
  var optionArgs = {};
  if (fileID != "") {
    var aFile = checkIsFile(fileID);
    var aFolder = checkIsFolder(fileID);
    if (aFile) {
      // Update Data validation values to represent a file:
      optionalArgs = { source: 'drive.google.com', 'drive.fileId': fileID, pageSize: config.PAGE_SIZE, 'userId': 'me','pageToken': pageToken };
    } else if (aFolder) {
      optionalArgs = { source: 'drive.google.com', 'drive.ancestorId': fileID, pageSize: config.PAGE_SIZE, 'userId': 'me', 'pageToken': pageToken };
    }
  } else { // DEFAULT TO SHOW ALL FILES AND FOLDER ACTIVITY IN DRIVE:
      optionalArgs = { source: 'drive.google.com', 'drive.ancestorId': 'root', pageSize: config.PAGE_SIZE, 'userId': 'me', 'pageToken': pageToken };
  }
  //log(optionalArgs);
  
  var pageToken;  
  var sh = SpreadsheetApp.getActiveSheet();
  var eventType = sh.getRange("B2").getValue();
  var fileID = sh.getRange(FILE_ID_CELL).getValue();
  
  var result = AppsActivity.Activities.list(optionalArgs);
  var activities = JSON.stringify(result.activities);    
  var parsedData = JSON.parse(activities);
  var filteredData;
  var eventType = config.defaultSettings.EVENT_TYPE;
  //Logger.log(eventType);
  
  for (var i=0; i<parsedData.length; i++) {
    var events = parsedData[i];
    
    // DEFAULT TO SINGLE EVENTS FOR NOW.... NEED TO DIVE IN FURTHER FOR COMBINED EVENTS
    if (eventType == "Single") {
      events = events.singleEvents;
      //Logger.log("Single Events" + events.length);
      //Logger.log(events);
    } else if (eventType == "Combined") {
      events = events.combinedEvent;
      //Logger.log("Combined Events " + events.length);
      //Logger.log(events);
    }
    var l = events.length;
    for (var j=0; j<l; j++) {
      var event = events[j];
      
      var timestamp = Utilities.formatDate(new Date(Number(event.eventTimeMillis)), "GMT-6", "yyyy/MM/dd HH:mm:ss");
      // File Details:
      var fileData = event.target;
      var fileName = fileData.name;
      var theFileID = fileData.id;
      var driveURL = theFileID;
      var fileType = getFileType(fileData.mimeType);
      //var fileId = fileData.id;
      var fileEventType = event.additionalEventTypes;
      
      // User Details:
      var userObj = event.user;
      //Logger.log(userObj);      
      if (userObj == null) { continue; }
      var userName = userObj.name;
      var userAvatar = userObj.photo;
      if (userAvatar == null) { userAvatar = ""; }
            
      var additionalEvents = event.additionalEventTypes;
      
      var eventData = "";
      
      var theEvent = additionalEvents.slice();
      if (theEvent[j] == "move") {
        //Logger.log("GET MOVE DATA");
        eventData = getKeyValues(event.move);
        //Logger.log(eventData);
      } else if (theEvent[j] == "rename") {
        //Logger.log("GET RENAME DATA");
        //Logger.log(event);
        eventData = getKeyValues(event.rename);
        //Logger.log(eventData);
      } else if (theEvent[j] == "comment") {
        var comments = getCommmentsById(theFileID);
        //Logger.log(comments);
        eventData = getKeyValues(comments);
      }
      //Logger.log("EVENT DATA");
      //Logger.log(eventData);
      
      // Permisssions:
      var permissions = event.permissionChanges;
      // Output a formatted string of the permissions changes.
      var permissionsOutput = (permissions == undefined) ? "" : getKeyValues(permissions[0]);
      
      data.push([timestamp, '=HYPERLINK("'+driveURL+'","'+fileName+'")', theFileID, userName, fileEventType, fileType, additionalEvents, eventData, permissionsOutput]);
    }    
  }
  Logger.log("Number of events: " + events.length);
  //filterByDateRange(data); // This method calls insertData.
  insertData("Sheet1", data);
}





function runMe() {
  var startTime= (new Date()).getTime();

  //do some work here

  var scriptProperties = PropertiesService.getScriptProperties();
  var startRow= scriptProperties.getProperty('start_row');
  for(var ii = startRow; ii <= size; ii++) {
    var currTime = (new Date()).getTime();
    if(currTime - startTime >= MAX_RUNNING_TIME) {
      scriptProperties.setProperty("start_row", ii);
      ScriptApp.newTrigger("runMe")
               .timeBased()
               .at(new Date(currTime+REASONABLE_TIME_TO_WAIT))
               .create();
      break;
    } else {
      doSomeWork();
    }
  }

  //do some more work here

}
























function updateConfigSheet() {
  // Loop through the triggers:
  var triggers = ScriptApp.getProjectTriggers();
  var l = triggers.length;
  
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drivewatch_config");
  var data = [];
  for (var i=0; i<l; i++) {
    var tName = triggers[i].getHandlerFunction();
    var tSource = triggers[i].getEventType();
    
    var range = sh.getRange(3+(i+1), 1, 2, 4);
    
    data.push([tName, tSource, config.defaultSettings.TRIGGER_HOUR, config.defaultSettings.TRIGGER_MINUTE]);
  }
  range.setValues(data);
}


function preprocessUserEvents(fileId) {
  //Logger.log("FILE ID" + fileId);
  //Logger.log("CALL USER EVENTS");
  
  // Update the fileID Cell:
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var range = sh.getRange(FILE_ID_CELL);
  range.setValue(fileId);
  
  getUserEvents(fileId);
}


/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService.createHtmlOutputFromFile('Picker.html')
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Select File or Folder');
}

function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

/** 
 * Update the UI of the spreadsheet
 */
function configUI_() {
  // Update the app name and include version:
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  sh.getRange(1, 1).setValue(config.APP_NAME + " (" + config.APP_VERSION + ")");
}


/**
 * Set the permissions based on the config settings
 */
function setPermissions() {
  Logger.log(config.sheetSettings.SS_ID);
  var file = DriveApp.getFileById(config.sheetSettings.SS_ID);
  if (file) {
    log("ACCESS: " + config.defaultSettings.ACCESS + " PERMISSIONS: " + config.defaultSettings.PERMISSIONS);
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.EDIT); //)(config.defaultSettings.ACCESS, config.defaultSettings.PERMISSIONS);
    log(file.getAccess(Session.getActiveUser().getEmail()));
  } else {
    Logger.log("FILE DOESN'T EXIST");
  }
}

/**
 * Initialize the project's triggers
 *    By Default we want to send a daily report at 9:30AM
 * TODO: 
 */
function initTriggers() {
  log("INIT TRIGGERS");
  
  deleteTriggers();
  
  if (config.defaultSettings.SEND_TRIGGER == "DAILY") {
    ScriptApp.newTrigger('getUserEvents').timeBased().everyDays(1).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    ScriptApp.newTrigger('sendEmailReport').timeBased().everyDays(1).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    
    log("DriveWatch::initTriggers::getUserEvents - DAILY");
    log("DriveWatch::initTriggers::sendEmailReport - DAILY");
  } else if (config.defaultSettings.SEND_TRIGGER == "WEEKLY") {
    ScriptApp.newTrigger('getUserEvents').timeBased().everyDays(7).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    ScriptApp.newTrigger('sendEmailReport').timeBased().everyDays(7).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    
    log("DriveWatch::initTriggers::getUserEvents - WEEKLY");
    log("DriveWatch::initTriggers::sendEmailReport - WEEKLY");
  } else if (config.defaultSettings.SEND_TRIGGER == "BI-WEEKLY") {
    ScriptApp.newTrigger('getUserEvents').timeBased().everyDays(14).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    ScriptApp.newTrigger('sendEmailReport').timeBased().everyDays(14).atHour(config.defaultSettings.TRIGGER_HOUR).nearMinute(config.defaultSettings.TRIGGER_MINUTE).create();
    
    log("DriveWatch::initTriggers::getUserEvents - BI-WEEKLY");
    log("DriveWatch::initTriggers::sendEmailReport - BI-WEEKLY");
  }
}

/** 
 * Deletes all of the projects triggers
 */
function deleteTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var l = triggers.length;
  for (var i=0; i<l; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
    log("TRIGGER DELETED: " + triggers[i].getHandlerFunction());
  }
}


function createMenu_() {
  var ss = SpreadsheetApp.openById(config.sheetSettings.SS_ID);
  // Open the spreadsheet and create a menu to run activity reports.
  var ui = SpreadsheetApp.getUi();
  var menuEntries = [];
  //menuEntries.push({name: config.locale.MENU_PICKER_FOLDER, functionName: 'showPicker'});
  menuEntries.push({name: config.locale.MENU_GENERATE_REPORT, functionName: 'getUserEvents'});
  menuEntries.push({name: config.locale.MENU_SEND_EMAIL_REPORT, functionName: 'sendEmailReport'});
  //menuEntries.push({name: config.locale.MENU_GET_COMMENTS, functionName: 'listComments'});
  ss.addMenu(config.APP_NAME, menuEntries);
  log("Create Menu");
}

/**
 * Create headers
 * @param {object} p_headers An array of headers to create.
 * @param {boolean} p_freeze Freeze the headers column.
 */
function createHeaders(p_headers, p_freeze) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Sheet1");
  var range = sh.getRange(START_HEADERS_ROW, 1, 1, p_headers.length);
  range.setValues([p_headers]);
  range.setFontWeight("bold");
  
  // Freeze the header rows:
  if (p_freeze) { sh.setFrozenRows(START_HEADERS_ROW); }  
}


  

/**
 * Function getFileSize returns the size of the file
 * @param {fileId} string The fileId to look up using Drive.Files.get(fileId)
 * @returns {fileSize} String The filesize of the file in question.
 */
function getFileSize(fileId) {
  //Logger.log(file.fileSize); // Note: The size of the file does not affect the Drive space quota so returns 0 bytes.
  try {
    //Logger.log("FILE ID: " + fileId);
    var file = DriveApp.getFileById(fileId);//.getSize();
    var bytes = formatBytes(file.fileSize, 0); // Refer to utils.gs for documentation on this function.
    return bytes;
  } catch(e) {
    Logger.log(e);
    //log("DriveWatch::getFileSize() for " + fileId + " " + e.toString());
  }
}

/**
 * Recursively loops through the object that is passed in and displays key value pairs
 *     TODO: Look into optimization options.
 * @param {theObj} The Object to loop through.
 * @return {String} A String with the key value pairs.
 */
function getKeyValues(theObj) {
  var output = "";
  var unique = {};
  for (var p in theObj) {
    if (theObj.hasOwnProperty(p)) {
      //output += "[" + p + "]: " + theObj[p] + "\n"
      if (typeof theObj[p] == "object") {
        //Logger.log("is Object:" + theObject[property]);
        //output += theObj[p];
        output += getKeyValues(theObj[p]);
      } else {
        output += "[" + p + "]: " + theObj[p] + "\n";
      }
    }
  }
  return output;
}

/**
 * This function will get a list of comments based on 
 *     the primary event type. Ideally it would make sense to display comments on demand.
 * @param {string} fileId The id of the file.
 * @returns {object} comments An array of comments for specified file.
 */
function getCommmentsById(fileId) {
  // 1. Make a call to the Google Drive External API (Reference:https://developers.google.com/drive/v3/reference/comments/list)
  // 2. Look into what fields need to be passed. (comments seems to work)
  //Logger.log("GET COMMENTS FOR FILE ID: " + fileId);
  var comments = Drive.Comments.list(fileId, {includeDeleted: true});
  return comments;
  //Logger.log(comments);
}

/**
 * This function will get a list of permissions based on 
 *
 * @param {string} fileId The id of the file.
 * @returns {object} permissions An array of permissions for specified file.
 */
function getPermissionsById(fileId) {
  var permissions = Drive.Files.get(fileId).permissions;
  return permissions;
}