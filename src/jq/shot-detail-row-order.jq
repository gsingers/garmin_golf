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
    ([range(1;12)] | map(tostring |
        "Shot \(.) - Shot Id",
        "Shot \(.) - Club Id",
        "Shot \(.) - Start Lie",
        "Shot \(.) - End Lie",
        "Shot \(.) - Order",
        "Shot \(.) - Distance (yds)",
        "Shot \(.) - Type",
        "Shot \(.) - End Lat",
        "Shot \(.) - End Lon",
        "Shot \(.) - Time"
    ) | .[])

],

# CSV Data
(
    .shotDetails[] |
        .holeNumber as $hole |
        .holeImageUrl as $holeImage |
        .pinPosition.lat as $ppLat |
        .pinPosition.lon as $ppLong |
        .shots?[0].scorecardId as $scorecardId |
        [
          $scorecardId,
          $hole,
          $holeImage,
          $ppLat,
          $ppLong,
          (.shots? | map(
                .id,
                .clubId,
                .startLoc.lie,
                .endLoc.lie,
                .shotOrder,
                .meters*1.093613,
                .shotType,
                .endLoc.lat,
                .endLoc.lon,
                .shotTime
            )? | .[])

        ]
)

| @csv

