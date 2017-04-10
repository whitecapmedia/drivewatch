function filterByDateRange(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var startDate = sh.getRange(START_DATE_CELL).getValue();
  var endDate = sh.getRange(END_DATE_CELL).getValue();
  //Logger.log(startDate.getYear() + " " + endDate.getYear());
  
  // Prompt user to input date:
  if (startDate == "") {
    ss.setActiveSelection(START_DATE_CELL);
    ss.toast(config.locale.ERROR_NO_DATE);
  } else if (endDate == "") {
    ss.setActiveSelection(END_DATE_CELL);
    ss.toast(config.locale.ERROR_NO_DATE);
  }    
  if (startDate != "" && endDate != "") {
    //Logger.log("GRAB DATA BY DATE RANGE: " + startDate + " and " + endDate);
    var l = data.length;
    var filteredData = [];
    for(var k=0; k<l; k++) {
      var timestamp = data[k][0];
      var date = new Date(timestamp.slice(0, 10)); // Convert String to Date
      var filteredData = data.filter(function (el) {
        //Logger.log(">>" + el[0]);
        var date = new Date(el[0].slice(0, 10));
        return (date >= startDate && date <= endDate);
      });
     }
    }
    Logger.log("FILTERED DATA", filteredData.length);
    Logger.log(filteredData);
    insertData("Sheet1", filteredData);
}

function testDateRange() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sDate = sh.getRange("B4").getValue();
  var eDate = sh.getRange("B5").getValue();
  var date = new Date("2017/03/20"); //Utilities.formatDate(new Date(sh.getRange("A562").getValue()), "GMT-6", "yyyy/MM/dd");
  var isDateInRange = checkDateRange(date, sDate, eDate);
  Logger.log(date + ": " + isDateInRange); 
}

function testFileSize() {
  // Log the name of every file in the user's Drive.
  var files = DriveApp.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var fileSize = formatBytes(file.getSize(), 0);
    //Logger.log("Filename: " + file.getName() + " Filesize::" + file.getSize()/1000 + "Kb");
    Logger.log("Filename::" + file.getName() + " " + fileSize);
  }
  return fileSize;
}

/** 
 * Function to format the filesize in a user readable format.
 * Source: http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 * @param {Number} bytes The allocated bytes to the file. Note that Google Apps files returns 0 bytes.
 * @param {Number} decimals The number of decimals to the right of the file's size (in bytes)
 * @returns {Number} The size of the file in a user-readable format.
 */
function formatBytes(bytes, decimals) {
  if (bytes == 0) { return "0 Bytes"; }
  var k = 1024; // 1 Byte
  var dm = decimals + 1 || 3;
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes/ Math.pow(k, i))).toFixed(dm) + ' ' + sizes[i];
}