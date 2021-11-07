# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

# CSV Header
[
    "Club Id",
    "Club Name",
    "Club Type",
    "Avg Distance (yards)",
    "Shots Count",
    "Percent Fairway Hit",
    "Percent Fairway Left",
    "Percent Fairway Right",
    "Percent Green Hit",
    "Percent Green Miss Left",
    "Percent Green Miss Right",
    "Percent Green Miss Short"

],

# CSV Data
(
    .clubs[] |
        [
          .id,
          .name?,
          .clubTypeId,
          .clubStats.averageDistance*1.093613,
          .clubStats.shotsCount,
          .clubStats.percentFairwayHit,
          .clubStats.percentFairwayLeft,
          .clubStats.percentFairwayRight,
          .clubStats.percentGreenHit,
          .clubStats.percentGreenMissLeft,
          .clubStats.percentGreenMissRight,
          .clubStats.percentGreenMissShort
        ]
)

| @csv
