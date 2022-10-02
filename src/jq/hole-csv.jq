# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

def datetime_to_seconds:
  if test("[-+]")
  then capture("(?<datetime>^.*T[0-9:]+)(?<s>[-+])(?<hh>[0-9]+):?(?<mm>[0-9]*)")
  | (.datetime +"Z" | fromdateiso8601) as $seconds
  | (if .s == "+" then -1 else 1 end) as $plusminus
  | ([.hh,.mm] | map(tonumber) |.[0] *= 60 | add * 60 * $plusminus) as $offset
  | ($seconds + $offset)
  else . + (if test("Z") then "" else "Z" end) | fromdateiso8601
  end;

# CSV Header
[
    "Scorecard Id",
    "Course",
    "Date",
    "Hole Number",
    "Hole - Par",
    "Hole - Strokes",
    "Putts",
    "Strokes Relative to Par",
    "Double or worse",
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
            $scorecard.startTime,
            .number,
            $course.holePars[.number-1:.number],
            .strokes,
            .putts,
            if ($course.holePars[.number-1:.number] and .strokes) then .strokes? - ($course.holePars[.number-1:.number]|tonumber)  else "" end,
            if ($course.holePars[.number-1:.number] and .strokes) and (.strokes? - ($course.holePars[.number-1:.number]|tonumber) >= 2) then "true"  else "false" end,
            .fairwayShotOutcome
        ]
)

| @csv



#             #(" " + $scorecard.startTime + " "|rtrimstr(" ")|strptime("%Y-%m-%dT%H:%M:%S%Z")|mktime|todate),