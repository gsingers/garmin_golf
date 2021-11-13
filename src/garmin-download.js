//Derived from https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorth York
//Modified by Grant Ingersoll to include shot data
/* v3 (2021-03-18) */
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

  alert("Press OK to export Garmin golf data (this may take a while)");

  const details = [];
  const allShotDetails = [];
  let allClubs = [];
  let summary = {};
  let pendingRequests = 1;//start at one for getting the club data, but we don't do onreceive b/c this isn't the maain call
  jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/club/player?per-page=1000&include-stats=true&_=1636130447923",
      function (clubData) {
        if (clubData.length === 0){
          console.log("No Club Data found");
        }
        allClubs = clubData;
        pendingRequests--;//since we started at 1, we do need to decrement here even though we aren't doing onreceive
      }).fail(function () {
    console.log(`Failed to retrieve player club data`);
    pendingRequests--;
    onReceive();
  });
  jQuery.getJSON(
      `https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/scorecard/summary?per-page=10000&user-locale=en&_=1615882865621`,
      function (_summary) {
        summary = _summary;
        const scorecardSummaries = (summary.scorecardSummaries || []);
        pendingRequests = scorecardSummaries.length;
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
  })

  //jQuery.getJSON("https://connect.garmin.com/modern/proxy/gcs-golfcommunity/api/v2/shot/scorecard/194545130/hole?hole-numbers=6&image-size=IMG_730X730&_=1635952489437")
  function onReceive() {
    if (pendingRequests > 0) {
      return;
    }
    const sortedDetails = details.sort((a, b) => ((a, b) => (a > b) - (a < b))(getCardField(a, "startTime"), getCardField(b, "startTime")))
    addDialog(summary, sortedDetails, allShotDetails, allClubs);
  }

  const getCardField = (cardInfo, field) => {
    const scorecard = cardInfo.scorecardDetails.find(element => element && element.scorecard !== undefined)
    if (scorecard) {
      return scorecard.scorecard[field];
    }
    return "";
  }


  function addDialog(summary, details, shotDetails, clubs) {
    addCSS();
    jQuery("#_gc-golfdata_modal").remove();

    const data = {
      summary,
      details,
      shotDetails,
      clubs
    }

    const output = JSON.stringify(data, null, 2)

    jQuery('body').append(`
            <meta name="google-signin-client_id" content="1038061099118-vq897e6noh766v0vaiqn8ql9b39bfidb.apps.googleusercontent.com">
            <div id="_gc-golfdata_modal" class="_gc-golfdata-modalDialog">
                <div><a href="#" title="Close" id="_gc-golfdata-close" class="_gc-golfdata-close">X</a>
                        <h2>Garmin Golf Scorecards</h2>

                    <textarea readonly id="_gc-golfdata_textarea" rows="20" style="width:100%" spellcheck="false"
                    >${output}</textarea>
                    <br>
                    <br>
                    <div class="g-signin2" data-onsuccess="onSignIn"></div>
                    <div>
                        <div style="float:left">
                            <button class="_gc-golfdata-btn" id="_gc-golfdata_copy">Copy to Clipboard</button>
                            <span id="_gc-golfdata-copied" style="display:none">Golf data copied to clipboard 👍</span>
                        </div>
                        <div style="float:right">
                            <a class="_gc-golfdata-btn" download='golf-export.txt' href='data:text/plain;charset=utf-8,${escape(output)}'>Download</a>
                        </div>
                    </div>
                    <div style="clear:both"></div>
                </div>
            </div>
    `);
    jQuery("#_gc-golfdata-close").click(function () {
      jQuery("#_gc-golfdata_modal").remove();
      return false;
    });
    jQuery("#_gc-golfdata_copy").click(function () {
      let el = document.getElementById("_gc-golfdata_textarea");
      el.select();
      document.execCommand('copy');
      jQuery("#_gc-golfdata-copied").show();
      return false;
    });
  }

  function addCSS() {
    // based on https://jsfiddle.net/kumarmuthaliar/GG9Sa/1/
    let styles = `
    ._gc-golfdata-modalDialog {
        position: fixed;
        font-family: Arial, Helvetica, sans-serif;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999;
        // opacity:0;
        -webkit-transition: opacity 400ms ease-in;
        -moz-transition: opacity 400ms ease-in;
        transition: opacity 400ms ease-in;
    }

    ._gc-golfdata-modalDialog > div {
        width: 600px;
        position: relative;
        margin: 10% auto;
        padding: 5px 20px 13px 20px;
        border-radius: 10px;
        background: #eee;
        /*background: -moz-linear-gradient(#fff, #999);
        background: -webkit-linear-gradient(#fff, #999);
        background: -o-linear-gradient(#fff, #999);*/
    }
    ._gc-golfdata-close {
        background: #606061;
        color: #FFFFFF;
        line-height: 25px;
        position: absolute;
        right: -12px;
        text-align: center;
        top: -10px;
        width: 24px;
        text-decoration: none;
        font-weight: bold;
        -webkit-border-radius: 12px;
        -moz-border-radius: 12px;
        border-radius: 12px;
        -moz-box-shadow: 1px 1px 3px #000;
        -webkit-box-shadow: 1px 1px 3px #000;
        box-shadow: 1px 1px 3px #000;
    }
    ._gc-golfdata-close:hover {
        background: #00d9ff;
    }

    ._gc-golfdata-btn, ._gc-golfdata-btn:hover, ._gc-golfdata-btn:visited, ._gc-golfdata-btn:active {
        color: #fff;
        background-color: #337ab7;
        border-color: #2e6da4;
        text-decoration:none;

        display: inline-block;
        margin-bottom: 0;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -ms-touch-action: manipulation;
        touch-action: manipulation;
        cursor: pointer;
        background-image: none;
        border: 1px solid transparent;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        border-radius: 4px;
    }

    #_gc-golfdata_textarea {
        font-family: "Lucida Console", Monaco, Monospace
    }
    `

    jQuery("#_gc-golfdata_styles").remove();
    let styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.id = "_gc-golfdata_styles"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet);

  }
}

gcExportGolfScores();