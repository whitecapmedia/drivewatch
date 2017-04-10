function sendEmailReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast(config.locale.TOAST_SEND_REPORT_MSG, config.locale.TOAST_SEND_REPORT_TITLE);
  var timestamp = new Date().getTime();
  var fileName = "DriveWatch_report_"+timestamp;
  var activityReport = createSpreadsheet(fileName); // Generate random id later
  //activityReport.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.VIEW);
  
  log("SEND EMAIL REPORT VIA TRIGGER");
  
  // Include Date Range in subject:
  var message = "Hello, " + Session.getActiveUser().getEmail() + " <br/><br/>";
  message += 'You requested a <a href="%_LINK_TO_NEW_SHEET_%">report</a> of your Google Drive activity for the date range %_DATE_RANGE_% \n\n';
  //message += "%_LINK_TO_NEW_SHEET_%";
  
  message = message.replace("%_LINK_TO_NEW_SHEET_%", generateLinkToDrive(activityReport.getId()));
  
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "DriveWatch report", '', {htmlBody: message}); // include inline images with logo later!
}

function createSpreadsheet(fileName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheets()[0];
  
  var newSheet = SpreadsheetApp.create(fileName);
  var sheetID = newSheet.getId();
  
  sh.copyTo(newSheet);
  var folderExists = checkFolderExists(config.defaultSettings.REPORT_FOLDER_NAME);
  
  if (folderExists) {
    saveFolder = DriveApp.getFolderById(folderExists);
  } else {
    saveFolder = DriveApp.createFolder(config.defaultSettings.REPORT_FOLDER_NAME);
  }
  
  // Make a copy of the file in the root drive.
  var file = DriveApp.getFileById(sheetID);
  // Take the copy of the file created above and move it into the reports folder:
  var newFile = DriveApp.getFolderById(saveFolder.getId()).addFile(file);
  
  // Remove the copy of the file in the root drive.
  var docfile = file.getParents().next().removeFile(file);
  
  return file;
}


/*function createPDF(reportName) {
  // Do we want to create a new file each time and store in reports folder?
  var fileToUse = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1"); // DEFAULT TO CURRENT SHEET (FOR NOW).
  if (fileToUse != null) {
    log(fileToUse);
  }
  var templateFile = DriveApp.getFileById(config.sheetSettings.SS_ID);
  var itsTheBlob = templateFile.getBlob().getAs(MimeType.GOOGLE_SHEETS);
  log("PDF REPORT GENERATED:: " + itsTheBlob);
  // Create the reports folder if doesn't exist:
  // Should probably throw this in a try catch!!
  var folderExists = checkFolderExists(config.defaultSettings.REPORT_FOLDER_NAME);
  if (folderExists) {
    saveFolder = DriveApp.getFolderById(folderExists);
  } else {
    saveFolder = DriveApp.createFolder(config.defaultSettings.REPORT_FOLDER_NAME);
  }
  var newFile = saveFolder.createFile(itsTheBlob);     
  return newFile;  
}*/

function checkFolderExists(fName) {
  try {
    var folderId;
    var folders = DriveApp.getFolders();
    
    while (folders.hasNext()) {
      var folder = folders.next();
      folderName = folder.getName();
      if (folderName == fName) {
        folderId = folder.getId();
      }
    }
  } catch(e) {
    log("Services::checkFolderExists()" + e.toString());
    throw e;
  }  
  return folderId;
}

function insertData(sheet, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheet);
  //Logger.log(data.length);
  if (data.length > 0) {
    ss.toast("Inserting " + data.length + " rows.");
    var range = sh.getRange(START_HEADERS_ROW+1, 1, data.length, headersArray.length);
    // Format cells:
    range.setVerticalAlignment("top");
    // Populate Cells:
    range.setValues(data);
  } else {
    ss.toast("No results returned. All done.");
  }
}