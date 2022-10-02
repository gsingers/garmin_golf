# Based on https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/128000/export-golf-scorecards/1229772#1229772 by WillNorthYork
# v3 (2021-03-20)

# CSV Header First
[
    "Handicap",
    "Handicap Trend",
    "Penalties per round",
    "Bunkers per round",
    "Recoveries per round"
    
],
[
  .last10DataStats.handicap,
  .last10DataStats.handicapTrend,
  .last10DataStats.penaltiesPerRound,
  .last10DataStats.bunkersPerRound,
  .last10DataStats.recoveriesPerRound
] | @csv