/**
 * ConfigService.gs
 * Author: Nick Johnston
 * Created on: Wednesday, April 5, 2017
 *
 * This file intends to store configuration settings for each user's Drive Activity.
 * Currently, config settings that the user can override or modify are:
 * 
 *  1. See active triggers for each report that is generated. Editing values will reinitialize the triggers for the user.
 *  2. 
 */ 
 
// Store the Spreadsheet ID to output the drive activity.
// TODO: Store this in its own ConfigService and use PropertiesService
var config = {
  "APP_NAME": "DriveWatch",
  "APP_VERSION": "pre0.2",
  "PAGE_SIZE": 1000,
  defaultSettings: {
    "REPORT_FOLDER_NAME": "DriveWatch_Reports",
    "SEND_NOTIFICATIONS": true,
    "ACCESS": "PRIVATE", // ANYONE, ANYONE_WITH_LINK, DOMAIN, DOMAIN_WITH_LINK, PRIVATE
    "PERMISSIONS": "EDIT", // VIEW, EDIT, COMMENT, OWNER, ORGANIZER, NONE
    "SEND_TRIGGER": "DAILY", // DAILY, WEEKLY, BI-WEEKLY
    "TRIGGER_HOUR": 11,
    "TRIGGER_MINUTE": 40,
    "EVENT_TYPE": "Single"
  },
  userSettings: {
  
  },
  sheetSettings: {
    "SS_ID": "1EQ80IVHlgPhCtXfCNzlwNJMiEVRA6sphvBZSo9wuO9o",
    "LOG_SHEET": "19V3vdIwdVQoRS-HKoTqNk60daZ_VXDMfI5KW2QFuEtw",
  },
  locale: {
    "MENU_GENERATE_REPORT": "Generate Activity Report!",
    "MENU_PICKER_FOLDER": "Select a file or folder",
    "MENU_GET_COMMENTS": "Get all comments",
    "MENU_SEND_EMAIL_REPORT": "Send Email Report",
    "TOAST_SEND_REPORT_TITLE": "Generating Spreadsheet",
    "TOAST_SEND_REPORT_MSG": "Hang tight, Spreadsheet is getting generated...",
    "NO_FILES_IN_DATE_RANGE": "There is no Drive activity within the date range specified.", 
    "ERROR_NO_DATE": "Please set a date range in the format (yyyy/MM/dd)"
  }
}



function outputConfig() {
  var keys = Object.keys(config.defaultSettings);
  //Logger.log(keys);
  for(var n in config.defaultSettings) {
    Logger.log(keys[n] + "::" + config.defaultSettings[n]);
  }
}