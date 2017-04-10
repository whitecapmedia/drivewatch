/**
 *
 */
function generateLinkToDrive(fileId) {
  // Confirm File's mime type to ensure the link generated is accurate.
  if (fileId == null) { 
    log("generateLinkToDrive::fileId " + fileId + " is null");
    return; 
  }
  try {
    var file = DriveApp.getFileById(fileId);
    var templateLink = "https://drive.google.com/open?id=%_FILE_ID_%";
    return templateLink.replace("%_FILE_ID_%", fileId);
  } catch(e) {
    log("generateLinkToDrive::"+e.toString());
  }  
}

/**
 * Checks if the file Id passed in is a file
 * 
 * @param {string} fileID The fileId of the file requested.
 * @returns {boolean} Returns the file type as a readable string.
 */
function checkIsFile(fileID) {
  try {
    var file = DriveApp.getFileById(fileID);
    Logger.log(file.getMimeType());
    return (file.getMimeType() !== MimeType.FOLDER) ? true : false;
  } catch(e) {
    // Doesn't exist/you don't have permissions.
    Logger.log(e);
    return false;
 }
}
/**
 * Checks if the folder Id passed in is a folder
 * 
 * @param {string} fileID The fileId of the file requested.
 * @returns {boolean} Returns the file type as a readable string.
 */
function checkIsFolder(folderID) {
  try {
    var folder = DriveApp.getFileById(folderID);
    Logger.log(folder.getMimeType());
    Logger.log(MimeType.FOLDER);
    return (folder.getMimeType() === MimeType.FOLDER) ? true : false;
  } catch(e) {
    // Doesn't exist/you don't have permissions.
    Logger.log(e);
    return false;
 }
}

/**
 * Get Drive Files MimeType
 * 
 * @param {string} mimeType The mimetype of the file requested.
 * @returns {string} Returns the file type as a readable string.
 */
function getFileType(mimeType) {
  
  var filetype = "";
  
  switch (mimeType) {
    case MimeType.GOOGLE_APPS_SCRIPT: filetype = 'Google Apps Script'; break;
    case MimeType.GOOGLE_DRAWINGS: filetype = 'Google Drawings'; break;
    case MimeType.GOOGLE_DOCS: filetype = 'Google Docs'; break;
    case MimeType.GOOGLE_FORMS: filetype = 'Google Forms'; break;
    case MimeType.GOOGLE_SHEETS: filetype = 'Google Sheets'; break;
    case MimeType.GOOGLE_SLIDES: filetype = 'Google Slides'; break;
    case MimeType.FOLDER: filetype = 'Google Drive folder'; break;
    case MimeType.BMP: filetype = 'BMP'; break;
    case MimeType.GIF: filetype = 'GIF'; break;
    case MimeType.JPEG: filetype = 'JPEG'; break;
    case MimeType.PNG: filetype = 'PNG'; break;
    case MimeType.SVG: filetype = 'SVG'; break;
    case MimeType.PDF: filetype = 'PDF'; break;
    case MimeType.CSS: filetype = 'CSS'; break;
    case MimeType.CSV: filetype = 'CSV'; break;
    case MimeType.HTML: filetype = 'HTML'; break;
    case MimeType.JAVASCRIPT: filetype = 'JavaScript'; break;
    case MimeType.PLAIN_TEXT: filetype = 'Plain Text'; break;
    case MimeType.RTF: filetype = 'Rich Text'; break;
    case MimeType.OPENDOCUMENT_GRAPHICS: filetype = 'OpenDocument Graphics'; break;
    case MimeType.OPENDOCUMENT_PRESENTATION: filetype = 'OpenDocument Presentation'; break;
    case MimeType.OPENDOCUMENT_SPREADSHEET: filetype = 'OpenDocument Spreadsheet'; break;
    case MimeType.OPENDOCUMENT_TEXT: filetype = 'OpenDocument Word'; break;
    case MimeType.MICROSOFT_EXCEL: filetype = 'Microsoft Excel'; break;
    case MimeType.MICROSOFT_EXCEL_LEGACY: filetype = 'Microsoft Excel'; break;
    case MimeType.MICROSOFT_POWERPOINT: filetype = 'Microsoft PowerPoint'; break;
    case MimeType.MICROSOFT_POWERPOINT_LEGACY: filetype = 'Microsoft PowerPoint'; break;
    case MimeType.MICROSOFT_WORD: filetype = 'Microsoft Word'; break;
    case MimeType.MICROSOFT_WORD_LEGACY: filetype = 'Microsoft Word'; break;
    case MimeType.ZIP: filetype = 'ZIP'; break;
    default: filetype = "Unknown";
  }
  return filetype;
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


/**
 * This helper function will group similar properties in an array based on multiple properties. 
 * http://codereview.stackexchange.com/questions/37028/grouping-elements-in-array-by-multiple-properties
 * TODO: Look into _lodash.groupBy (npm module)
 *
 * @param {string} p_fileId The id of the file.
 * @returns {object} comments An array of comments for specified file.
 */
function groupBy_(array, f) {
  // Create an object store.
  var groups = {};
  // Loop through array data and store 
  array.forEach(function(o) {
    var group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  
  return Object.keys(groups).map(function(group) {
   return groups[group]; 
  });
}

/**
 * This function clears the sheet of all previously returned data
 * NJ: TODO store all old data in a logging sheet (if enabled).
 */
function clearSheet(p_sheetName, p_range) {
  var sheetName = (p_sheetName == null) ? "Sheet1" : p_sheetName;
  //Logger.log(sheetName);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  sh.getRange(p_range).clear();
}


/**
 *******************************
 * DATE AND TIME HELPER METHODS:
 *******************************
 */

/**
 * Convert Timestamp to date:
 * @param {string} The timestamp that we want to convert.
 * @returns {string} time A formatted string.
 */
function convertTsToDate_(p_timestamp) {
  var d = new Date(p_timestamp);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var year = d.getFullYear();
  var month = d.getMonth()+1; //months[d.getMonth()];
  var date = d.getDate();
  var hour = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var time = year + '/' + month + '/' + date + ' ' + padString(hour, 2) + ':' + padString(minutes, 2) + ':' + padString(seconds, 2);
  return time;
}


/**
 * 
 */
function padString_(p_string, num) {
  var str = p_string.toString();
  while (p_string.length < num) {
    str = '0' + str;
  }
  Logger.log("PAD: " + p_string + " to " + str);
  return str;
}

/**
 * Function that checks if date is in range of a set of dates
 * @param {func} 
 */
function checkDateRange(date, start_date, end_date) {
  return (date >= start_date && date <= end_date) ? true : false;
}


/**
 * Thanks to Bruce McPherson for this handy dandy utility function!
 * Takes a function and its arguments, runs it and times it
 * @param {func} the function
 * @param {...} the rest of the arguments
 * @return {object} the timing information and the 
 *     function results.
 */
function timeFunction_() {
  var timedResult = {
    start: new Date().getTime(),
    finish: undefined,
    result: undefined,
    elapsed:undefined
  }
  // turn args into a proper array
  var args = Array.prototype.slice.call(arguments);
  
  // the function name will be the first argument
  var func = args.splice(0,1)[0];
  
  // the rest are the arguments to fn - execute it
  timedResult.result = func.apply(func, args); 
  
  // record finish time
  timedResult.finish = new Date().getTime();
  timedResult.elapsed = timedResult.finish - timedResult.start;
  
  return timedResult;
}
    
function testTime() {
  var timer = timeFunction_(getUserEvents);
  var data = timer.result;
  var elapsed = timer.elapsed;
  var start = timer.start;
  var finish = timer.finish;
  log('lookup started:' + timer.start);
  log('lookup finished:' + timer.finish);
  log('lookup took:' + timer.elapsed + " " + (Math.round((timer.elapsed/1000)/60)) + "minutes");
  log('lookup data:' + timer.result);
}


function groupBy( array , f ) {
  var groups = {};
  array.forEach( function( o ) {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );
  });
  return Object.keys(groups).map( function( group ) {
    return groups[group]; 
  })
}
/*var result = groupBy(list, function(item) {
  return [item.lastname, item.age];
});*/ 
 
