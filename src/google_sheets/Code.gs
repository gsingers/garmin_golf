// Derived from https://spreadsheet.dev/how-to-import-csv-files-into-google-sheets-using-apps-script and modified to import Garmin golf data

// This script assumes the following sheets exist within your active Spreadsheet: Analysis, Scorecards, Hole by Hole, Raw Shot Data Row Order, Raw Shot Data Column Order, Gear
// It also assumes data files have been exported according to the `convert-all-csv.sh` script in https://github.com/gsingers/garmin_golf
// It also assumes you have a directory named /sports/golf/data under your Drive Root folder that contains all your exported CSV files.
// This script will then import the data into the active spreadsheet. The files, once processed, will be moved to an archived folder under the data directory.


var data_location = "/sports/golf/data";
var SCORECARDS_SHEET = "Scorecards";
var HOLE_BY_HOLE_SHEET = "Hole by Hole";
var RAW_SHOT_ROW_SHEET = "Raw Shot Data Row Order";
var RAW_SHOT_COL_SHEET = "Raw Shot Data Column Order";
var GEAR_SHEET = "Gear";
var TEMP_SHEET = "Temp Calculations";

//@OnlyCurrentDoc
function onOpen(e) {
  var active = SpreadsheetApp.getActive();
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Import Garmin Data")
    .addItem("Import Garmin CSV", "showPicker")
    .addToUi();
}

//Displays an alert as a Toast message
function displayToastAlert(message) {
  SpreadsheetApp.getActive().toast(message, "⚠️ Alert");
}

function importGarminGolfData(folder_id){
  Logger.log("Importing Garmin Golf Data");
  var root = DriveApp.getRootFolder();

  //var golf_data_folder = root.getFoldersByName("sports").next().getFoldersByName("golf").next().getFoldersByName("data");//find a better way to do this
  var golf_data_folder = DriveApp.getFolderById(folder_id);
  if (golf_data_folder == null){
    Logger.log("No folders with name " + data_location);
    displayToastAlert("No folders with name " + data_location + " were found in Google Drive");
    return;
  }
  Logger.log("Importing folders");
  var the_folder = golf_data_folder;
  var archived_folder;
  var fold_iter = the_folder.getFoldersByName("archived");
  if (fold_iter.hasNext()){
    Logger.log("Found archived");
    archived_folder = fold_iter.next();
  } else{
    Logger.log("Creating archived");
    archived_folder = the_folder.createFolder("archived");
  }

  var data_files = the_folder.getFilesByType("text/csv");
  var scorecards;
  var hole_by_hole;
  var raw_shot_row;
  var raw_shot_col;
  var gear;
  if (data_files.hasNext()){
    while (data_files.hasNext()){
      csv_file = data_files.next();
      Logger.log(csv_file.getName());
      // As we process the files, move them to the archived folder and timestamp them
      //clunky, but it works given it feels just as clunky to get by name
      if (csv_file.getName().indexOf("scorecard") != -1){
        scorecards = csv_file;
        Logger.log("Importing scorecard data");
        writeDataToSheet(scorecards, SCORECARDS_SHEET);
      } else if (csv_file.getName().indexOf("hole") != -1){
        hole_by_hole = csv_file;
        Logger.log("Importing Hole By Hole data");
        writeDataToSheet(hole_by_hole, HOLE_BY_HOLE_SHEET);
      } else if (csv_file.getName().indexOf("col") != -1){
        raw_shot_col = csv_file;
        Logger.log("Importing Raw Shot data by Column");
        writeDataToSheet(raw_shot_col, RAW_SHOT_COL_SHEET);
      } else if (csv_file.getName().indexOf("row") != -1){
        raw_shot_row = csv_file;
        Logger.log("Importing Raw Shot data by Row");
        writeDataToSheet(raw_shot_row, RAW_SHOT_ROW_SHEET);
      } else if (csv_file.getName().indexOf("club"!= -1)){
        gear = csv_file;
        Logger.log("Importing clubs data");
        writeDataToSheet(gear, GEAR_SHEET);
      } else{
        Logger.log("Unknown file " + csv_file.getName() + ". Skippping.");
      }
      archiveRaw(csv_file, archived_folder);
    }
  } else {
    Logger.log("No CSV data files found in " + the_folder.getName());
  }
}

function archiveRaw(file_to_archive, archive_folder){
  Logger.log("Moving " + file_to_archive.getName() + " to " + archive_folder);
  file_to_archive.moveTo(archive_folder);
}

//Returns files in Google Drive that have a certain name.
function findFilesInDrive(filename) {
  var files = DriveApp.getFilesByName(filename);
  var result = [];
  while(files.hasNext())
    result.push(files.next());
  return result;
}

//Inserts a new sheet and writes a 2D array of data in it
function writeDataToSheet(csv_file, sheet_name) {
  var contents = Utilities.parseCsv(csv_file.getBlob().getDataAsString());
  var ss = SpreadsheetApp.getActive();
  sheet = ss.getSheetByName(sheet_name);
  Logger.log("Importing data into " + sheet_name);
  sheet.getRange(1, 1, contents.length, contents[0].length).setValues(contents);
  displayToastAlert("The CSV file was successfully imported into " + sheet_name + ".");
  return sheet.getName();
}

//From: https://www.labnol.org/code/20039-google-picker-with-apps-script
/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService.createHtmlOutputFromFile('Picker.html')
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Select Folder to Import Garmin Golf CSV data from');
}

function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

function testSpinner(){
 SpreadsheetApp.getActiveSpreadsheet().toast("Working...","",-1);
  Utilities.sleep(5000);
 SpreadsheetApp.getActiveSpreadsheet().toast("Done.");
}
