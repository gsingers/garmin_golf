# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

# CSV Header
[
    "Scorecard Id",
    "Start Time",
    "Start Time (UTC)",
    "Course",
    "Score",
    "Holes Played",
    "Handicap",
    "Strokes",
    "Handicapped Strokes",
    "Steps Taken",
    "Distance Walked",
    "Putts",
    "Under Par",
    "Pars",
    "Bogeys",
    "Over Bogey",
    "Birdie",
    "Eagle",
    "Better than Eagle",
    ([range(1;19)] | map(tostring |
        "Hole \(.) - Time (UTC)",
        "Hole \(.) - Par",
        "Hole \(.) - Strokes",
        "Hole \(.) - Putts",
        "Hole \(.) - Penalties",
        "Hole \(.) - Handicap Score",
        "Hole \(.) - Fairway Shot Outcome"
    ) | .[])

],

# CSV Data
(
    .details[] |
        .scorecardDetails[0].scorecard as $scorecard |
        .scorecardDetails[0].scorecardStats.round as $roundStats |
        .courseSnapshots[0] as $course |
        [
            $scorecard.id,
            $scorecard.formattedStartTime,
            $scorecard.startTime,
            $course.name,
            $scorecard.score,
            $scorecard.holesCompleted,
            $scorecard.playerHandicap,
            $scorecard.strokes,
            $scorecard.handicappedStrokes,
            $scorecard.stepsTaken,
            $scorecard.distanceWalked,
            $roundStats.putts,
            $roundStats.holesUnderPar,
            $roundStats.holesPar,
            $roundStats.holesBogey,
            $roundStats.holesOverBogey,
            $roundStats.holesBirdie,
            $roundStats.holesEagle,
            $roundStats.holesDoubleEagleOrUnder,
            ($scorecard.holes | map(
                .lastModifiedDt,
                $course.holePars[.number-1:.number],
                .strokes,
                .putts,
                .penalties,
                .handicapScore,
                .fairwayShotOutcome
            ) | .[])
        ]
)

| @csv
