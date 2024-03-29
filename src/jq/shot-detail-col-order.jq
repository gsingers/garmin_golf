# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

# CSV Header
[
    "Scorecard Id",
    "Hole",
    "Hole Image",
    "Pin Latitude",
    "Pin Longitude",
    "Pin X",
    "Pin Y",
    "Club Id",
    "Start Lie",
    "End Lie",
    "Order",
    "Distance (yds)",
    "Type",
    "End Lat",
    "End Lon",
    "Time"
],

# CSV Data
(
    .shotDetails[] |
        .holeNumber as $hole |
        .holeImageUrl as $holeImage |
        .pinPosition.lat as $ppLat |
        .pinPosition.lon as $ppLong |
        .pinPosition.x as $ppX |
        .pinPosition.y as $ppY |
        .shots[0].scorecardId as $scorecardId |
        .shots[]? |
        [
          $scorecardId,
          $hole,
          $holeImage,
          $ppLat,
          $ppLong,
          $ppX,
          $ppY,
          .clubId,
          .startLoc.lie,
          .endLoc.lie,
          .shotOrder,
          .meters*1.093613,
          .shotType,
          .endLoc.lat,
          .endLoc.lon,
          .shotTime

        ]
)

| @csv

