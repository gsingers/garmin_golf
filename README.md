# Garmin Golf Scripts

This repo was inspired by the [Export Golf Scorecards](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772) thread on the Garmin forums and the scripts by WillNorthYork for downloading and converting *your* Garmin golf data to JSON/CSV.  Since Garmin doesn't offer APIs for accessing one's own golf data, this really is the only approach for getting your data out of Garmin.

I've modified the [original code](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772) to download club data and shot-by-shot data for those users of Garmin's CT10 shot trackers.  


# Usage

Directions taken, more or less, from the thread linked above and modified for the script being in this repo.

## Usage without Installation

1. Download or otherwise copy/checkout the script in [`src/garmin-download.js`](https://github.com/gsingers/garmin_golf/blob/main/src/garmin-download.js)
1. Sign into Garmin Connect
1. While still on the Garmin Connect tab, open debug console: F12 / CTRL-SHIFT-I (Window) / CMD-OPTION-I (Mac)
1. Paste script into debug console. A dialog will open in the Garmin Connect tab.
1. To run it a 2nd time (for the same tab and session), type the following text in the console:
        
        gcExportGolfScores()
        
        
## Usage with Installation

1. Download or otherwise copy/checkout the script in [`src/garmin-download.js`](https://github.com/gsingers/garmin_golf/blob/main/src/garmin-download.js)
1. Open this page: https://caiorss.github.io/bookmarklet-maker/
1. Set title to "GC export golf scores"
    1. Paste script into "Code" box
    1. Click "generate bookmarklet"
    1. Drag blue bookmarklet to bookmarks bar. If the bookmarks bar isn't visible, press CTRL-SHIFT-B (Windows) / CMD-SHIFT-B (Mac).

If you don't have a bookmark bar or you're on mobile, select and copy the contents of Output box, bookmark any site at all, edit the bookmark, then paste what you just copied into the Address/Location/URL box. (In Firefox you can also right-click and select "Bookmark this link")

### After Installation

1. Sign into Garmin Connect

1.  Click on "GC export golf scores" bookmark. A dialog will open in the current tab.

## Convert JSON to CSV

NOTE: If you just want the JSON, you can skip this step 

### Prep

1. Install jq for your platform: https://stedolan.github.io/jq/download/
1. Clone or otherwise download this repository.  In the `src` directory are several `jq` scripts for converting various aspects of the JSON to CSV.
1. Create a `data` directory: `mkdir data`

This script will reshape some of your golf export data into tabular CSV data. (Only certain fields for each scorecard will be saved, like the scores for each hole.)

NOTE: This script is very basic. You may want to edit it to save more details from the export.

### Conversion

1. Use the export script to download your golf scorecard data. It will be saved as golf-export.json. Save this file to the `data` directory you created above.
1. Open Windows command prompt or MacOS/Linux terminal
1. Run the jq script on the exported data:
    
    To run one conversion script:

        jq -r -f src/scorecard-csv.jq data/golf-export.json > data/golf.csv
        
    To run all conversion scripts (Linux/Mac Terminal only) and output the results to the `data` directory:
    
        ./convert-all-csv.sh /path/to/json/file /path/to/store/results
        
    Converted files will be named the same as the JSON file with `.csv` tacked on the end.
    
    If you are going to import this data into Google Sheets, per below, you will need to either upload your CSV files to Google Drive or run the script to output the data to a Google Drive folder, as in:
    
        ./convert-all-csv.sh data/golf-export.json "/Users/MyUser/Google Drive/sports/golf"
        
    

1. Open golf.csv with Excel or Numbers or import into Google Sheets.

    Windows:

        start data/golf.csv

    MacOS:

        open data/golf.csv
        
        
        
# Import into Google Sheets

Under the `src/google_sheets` directory are scripts and HTML files that can be used via the Google Sheets Apps Script function to automatically import your CSV data as generated above
from a selected Google Drive folder and import it into your current Spreadsheet, *assuming* your spreadsheet is set up a specific way.

## Installing the Google Sheets Apps Script

Note: this is not a Google Apps Script tutorial.  See https://developers.google.com/apps-script?hl=en for details on getting started and understanding Google Apps Script.

1. Create a new Google Spreadsheet.  (If you are using Google Chroome and are logged in as a Google user, you can simply type `sheets.new` in the Chrom URL window)
1. Create 6 sheets by hitting the "little plus button" in the lower right corner of your Spreadsheet or choosing `Insert->Sheet` six (6) times
1. Name the sheets: Scorecards, Hole by Hole, Raw Shot Data Row Order, Raw Shot Data Column Order, Gear

        As an aside, I also create an `Analysis` sheet where I plug in all my analysis formulas and dashboards

1. Choose `Extensions->Apps Script` from the Spreadsheet menu.  This should pop open a new window called `Apps Script` titled `Untitled Project`.  Name your project. 
1. Under the `Editor` part of the Apps Script project do the following:
    1. Copy and paste the `src/google_sheets/Code.gs` file into the `Code.gs` editor window.
    1. Create a new HTML file in the project by selecting the `+` button next to the `Files` menu in the `Editor` part of the project. Choose `HTML` from the popup.  Call it `Picker`
        1. You should now see two files under your project: `Code.gs` and `Picker.html`
    1. Replace the generated HTML in `Picker.html` by copying and pasting the HTML in `src/google_sheets/Picker.html`.
    1. Make sure both files are saved.  
1. Reload your spreadsheet.  You should now see a new menu titled `Import Garmin Data`
1. Select the menu item and follow the prompts.  Once completed, you should see your data in the 6 spreadsheets.
         

        