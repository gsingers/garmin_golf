//Derived from https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorth York
//Modified by Grant Ingersoll to include shot data
/* v3 (2021-03-18) */
// This file is primarily used in conjunction with Playwright.  It writes the results of all the data to a Div on the page, which Playwright then acquires.
//If you are looking to have an actual download, you want the garmin-download.js file.
function gcExportGolfScores() {

  let loc = window.location.href

  let connectURL = "https://connect.garmin.com";
  if (loc.indexOf(connectURL) != 0 || typeof jQuery === "undefined") {
    alert(
        `You must be logged into Garmin Connect to run this script.

(Your current tab must also be a Garmin Connect page with
URL starting with: ${connectURL})`);
    return;
  }

  // Garmin Connect uses jQuery, so it's available for this script
  jQuery("#_gc-golfdata_modal").remove();

  //alert("Press OK to export Garmin golf data (this may take a while)");

  const details = [];
  const allShotDetails = [];
  let allClubs = [];
  let last10DataStats = {};
  let last10DataPutt = {};
  let last10DataChip = {};
  let last10DataDrive = {};
  let last10DataApproach = {};
  let summary = {};
  let pendingRequests = 6;//start at one for getting the club data, but we don't do onreceive b/c this isn't the maain call
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/club/player?per-page=1000&include-stats=true&_=1636130447923",
      function (clubData) {
        if (clubData.length === 0) {
          console.log("No drive Data found");
        }
        allClubs = clubData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
    console.log(`Failed to retrieve player club data`);
    pendingRequests--;
    onReceive();
  });
  //Get player stats
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/player/stats",
      function (statsData) {
        if (statsData.length === 0) {
          console.log("No overall stats Data found");
        }
        last10DataStats = statsData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
        console.log(`Failed to retrieve last 10 stats data`);
        pendingRequests--;
        onReceive();
  });
  //Get driving data
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/stats/drive",
      function (driveData) {
        if (driveData.length === 0) {
          console.log("No driving Data found");
        }
        last10DataDrive = driveData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
        console.log(`Failed to retrieve last 10 drive data`);
        pendingRequests--;
        onReceive();
  });
  //Get approach data
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/stats/approach",
      function (approachData) {
        if (approachData.length === 0) {
          console.log("No approach Data found");
        }
        last10DataApproach = approachData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
        console.log(`Failed to retrieve last 10 approach data`);
        pendingRequests--;
        onReceive();
  });
  //Get Chipping Data
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/stats/chip",
      function (chipData) {
        if (chipData.length === 0) {
          console.log("No chip Data found");
        }
        last10DataChip = chipData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
        console.log(`Failed to retrieve last 10 chip data`);
        pendingRequests--;
        onReceive();
  });
  // Get Putting data
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/stats/putt",
      function (puttData) {
        if (puttData.length === 0) {
          console.log("No putt Data found");
        }
        last10DataPutt = puttData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
        console.log(`Failed to retrieve last 10 putt data`);
        pendingRequests--;
        onReceive();
  });
  
  jQuery.getJSON(
      `https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/scorecard/summary?per-page=10000&user-locale=en&_=1615882865621`,
      function (_summary) {
        summary = _summary;
        const scorecardSummaries = (summary.scorecardSummaries || []);
        pendingRequests = pendingRequests + scorecardSummaries.length;
        if (scorecardSummaries.length === 0) {
          alert("No golf scorecards found");
          return;
        }
        scorecardSummaries.forEach(
            function (cardSummary) {
              jQuery.getJSON(
                  `https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/scorecard/detail?scorecard-ids=${cardSummary.id}&include-longest-shot-distance=true`,
                  function (cardDetails) {
                    details.push({
                          startTime: getCardField(cardDetails, "startTime"),
                          formattedStartTime: getCardField(cardDetails, "formattedStartTime"),
                          ...cardDetails
                        }
                    );
                    //get the per shot details
                    //jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/scorecard/194545130/hole?hole-numbers=6&image-size=IMG_730X730&_=1635952489437")
                    holes = getCardField(cardDetails, "holes");
                    if (holes) {
                      holes.forEach(
                          function (hole) {//for each hole, get the shot data
                            //console.log("hole: " + hole.number + " putts: " + hole.putts);
                            pendingRequests++;
                            jQuery.getJSON(`https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/scorecard/${cardSummary.id}/hole?hole-numbers=${hole.number}&image-size=IMG_730X730&_=1635952489437`,//TODO: do we need the image-size?
                                function (shotDetails) {
                                  //console.log("hole: " + shotDetails[0].holeNumber);
                                  //console.log(shotDetails.holeShots[0]);
                                  allShotDetails.push(shotDetails.holeShots[0])
                                  pendingRequests--;
                                  onReceive();
                                })
                                .fail(function () {
                                  console.log(`Failed to retrieve shot data with scorecard ID ${cardSummary.id} and hole number ${hole.number}`);
                                  pendingRequests--;
                                  onReceive();
                                })
                          }
                      )
                    }
                    pendingRequests--;
                    onReceive();
                  }
              )
                  .fail(function () {
                    console.log(`Failed to retrieve scorecard with ID ${cardSummary.id}`);
                    pendingRequests--;
                    onReceive();
                  });
            }
        )
      }
  ).fail(() => {
    alert("Failed to get scorecard summary list")
  });
  

  //jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/scorecard/194545130/hole?hole-numbers=6&image-size=IMG_730X730&_=1635952489437")
  function onReceive() {
    if (pendingRequests > 0) {
      //console.log("Pending: " + pendingRequests)
      return;
    }
    const sortedDetails = details.sort((a, b) => ((a, b) => (a > b) - (a < b))(getCardField(a, "startTime"), getCardField(b, "startTime")))
    do_download(summary, sortedDetails, allShotDetails, allClubs);
  }

  const getCardField = (cardInfo, field) => {
    const scorecard = cardInfo.scorecardDetails.find(element => element && element.scorecard !== undefined)
    if (scorecard) {
      return scorecard.scorecard[field];
    }
    return "";
  }


  function do_download(summary, details, shotDetails, clubs) {

    const data = {
      summary,
      details,
      shotDetails,
      clubs,
      last10DataStats,
      last10DataDrive,
      last10DataApproach,
      last10DataChip,
      last10DataPutt
    }
    console.log("Data")
    console.log(data)
    const output = JSON.stringify(data, null, 2)
    //jQuery('#pageContainer').append(`<a class="_gc-golfdata-btn" id='downloadButton' download='golf-export.json' href='data:text/plain;charset=utf-8,${escape(output)}'>Download</a>`);
    //jQuery('#downloadButton').click()
    jQuery('#pageContainer').append('<div>Output:</div><div id="score_output">' + output + '</div>')
    //window.location = encodeURI("data:text/plain;charset=utf-8,"+ output)
    //data:text/plain;charset=utf-8,${escape(output)}
  }
  
}

gcExportGolfScores();