# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

# CSV Header
[
    "Scorecard Id",
    "Course",
    "Hole Number",
    "Hole - Par",
    "Hole - Strokes",
    "Hole - Fairway Shot Outcome"
],

# CSV Data
(
    .details[] |
        .scorecardDetails[0].scorecard as $scorecard |
        .courseSnapshots[0] as $course |
        $scorecard.holes[] |
        [
            $scorecard.id,
            $course.name,
            .number,
            $course.holePars[.number-1:.number],
            .strokes,
            .fairwayShotOutcome
        ]
)

| @csv
