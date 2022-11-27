#
# Take in the raw JSON from Garmin (see garmin-download.js in this same repo and the README on how to do that)
# and turn it into useful insights
import pandas as pd
import json
import argparse
import os
import logging

logging.basicConfig(level=logging.INFO)

class GarminDataExport:
    all_data = {}

    def __init__(self) -> None:
        super().__init__()


    def from_bytes(self, bytes):
            golf_raw = json.loads(bytes)
            self.from_json_dict(golf_raw)

    def from_json_dict(self, golf_raw):
        clubs_df = self.process_clubs(golf_raw["clubs"])
        (cards_df, courses_df, holes_df) = self.process_scorecard(golf_raw["details"])  # always one of these
        shots_df = self.process_shots(golf_raw["shotDetails"])
        last_10_stats = self.process_last10_stats(golf_raw["last10DataStats"])  # strokes gained is nested here
        (last_10_drive, drive_shot_disp_df) = self.process_last10_drives(golf_raw["last10DataDrive"])
        (last_10_approach, appr_shot_orientation_df, dist_range_insights_df,
         club_insights_df) = self.process_last10_approach(golf_raw["last10DataApproach"])
        last_10_chip, chip_shot_orientation_df = self.process_last10_chip(golf_raw["last10DataChip"])
        last_10_putt_df = self.process_last10_putt(golf_raw["last10DataPutt"])
        self.all_data["clubs"] = clubs_df
        self.all_data["cards"] = cards_df
        self.all_data["courses"] = courses_df
        self.all_data["holes"] = holes_df
        self.all_data["shots"] = shots_df
        self.all_data["last10Stats"] = last_10_stats
        self.all_data["last10Drive"] = last_10_drive
        self.all_data["last10DriveDispersion"] = drive_shot_disp_df
        self.all_data["last10Approach"] = last_10_approach
        self.all_data["last10ApproachShotOrientation"] = appr_shot_orientation_df
        self.all_data["last10ApproachDistRangeInsights"] = dist_range_insights_df
        self.all_data["last10ApproachClubInsights"] = club_insights_df
        self.all_data["last10Approach"] = last_10_approach
        self.all_data["last10Chip"] = last_10_chip
        self.all_data["last10ChipOrientation"] = chip_shot_orientation_df
        self.all_data["last10Putt"] = last_10_putt_df

    def from_path(self, input):
        with open(input) as file:
            logging.info(f"Processing {input}")
            golf_raw = json.load(file)
            self.from_json_dict(golf_raw)

    def process_clubs(self, clubs):
        clubs_df = pd.DataFrame.from_dict(clubs)
        # convert over the clubstats, which are nested for some reason
        club_stats = clubs_df["clubStats"]
        norm_stats = pd.json_normalize(club_stats).dropna(how="all").drop(columns="lastModifiedTime")
        norm_stats["id"] = norm_stats["id"].astype("int64")
        clubs_df = clubs_df.drop(columns="clubStats")
        return pd.merge(clubs_df, norm_stats, on="id", suffixes=("_clubs", "_club_stats"))
    
    
    def process_holes(self, scorecard, course_snap):
        pars = course_snap["holePars"]  # looks like: "544435434543444435", so the index is the hole # - 1
        holes_df = pd.DataFrame(scorecard["holes"])
        # add id and course name, course id as scalars for convenience
        holes_df["scorecardId"] = scorecard["id"]
        holes_df["courseName"] = course_snap["name"]
        holes_df["courseGlobalId"] = course_snap["courseGlobalId"]
        holes_df["par"] = holes_df["number"].apply(lambda x: int(pars[x - 1]))
        holes_df["relative_to_par"] = holes_df["strokes"] - holes_df["par"]
        return holes_df
    
    
    def process_shots(self, shot_details):  # an array of shot Details, which then is the hole + all the shots
        for hole in shot_details:
            hole_num = hole["holeNumber"]
            hole_img = hole["holeImageUrl"]
            pin = hole["pinPosition"]
            shots = hole.get("shots")
            if shots:
                shots_df = pd.DataFrame.from_dict(shots)  # we will still have some nesting under this
                # flatten the start/end location info
                start = pd.json_normalize(shots_df["startLoc"]).rename(lambda x: "startLoc." + x, axis='columns')
                shots_df = pd.merge(shots_df, start, left_index=True, right_index=True)
                end = pd.json_normalize(shots_df["endLoc"]).rename(lambda x: "endLoc." + x, axis='columns')
                shots_df = pd.merge(shots_df, end, left_index=True, right_index=True)
                # add some common data
                shots_df["holeNumber"] = hole_num
                shots_df["holeImageUrl"] = hole_img
                shots_df["pin"] = pin

                return shots_df
            else:
                logging.info(f"No shots data for {hole}")

    def process_scorecard(self, scorecards):
        logging.info(f"Processing {len(scorecards)} scorecards")
        cards_df = pd.DataFrame()
        courses_df = pd.DataFrame()
        all_holes_df = pd.DataFrame()
        all_cards = []
        for scorecard_container in scorecards:
            course_snap = scorecard_container["courseSnapshots"][0]
            course_snap_df = pd.DataFrame.from_dict(course_snap)
            score_details = scorecard_container['scorecardDetails'][0]  # only one of these
            score_stats = score_details.pop('scorecardStats')  # only one of these
            the_scorecard = score_details["scorecard"] # remove it so
            holes_df = self.process_holes(the_scorecard, course_snap)
            the_scorecard.pop("holes") #remove the nesting, so we can build a DF
            all_cards.append(the_scorecard)
            logging.info(f"Processing: {course_snap['name']} with Score ID: {the_scorecard['id']} on date {the_scorecard['startTime']}")
            # TODO: convert types for dates
            # Add Round info
            for key, value in score_stats["round"].items():
                the_scorecard[key] = value
            # Construct our data frames
            all_holes_df = pd.concat([all_holes_df, holes_df])

            courses_df = pd.concat([courses_df, course_snap_df])
        cards_df = pd.DataFrame(all_cards).convert_dtypes(infer_objects=True)
        # get some dates
        cards_df["startTime"] = pd.to_datetime(cards_df["startTime"], infer_datetime_format=True)
        cards_df["endTime"] = pd.to_datetime(cards_df["endTime"], infer_datetime_format=True)
        courses_df = courses_df.drop_duplicates(subset=["courseGlobalId"])
        return cards_df, courses_df, all_holes_df
    
    
    def process_last10_stats(self, last10):
        return last10  # nothing to do here for now, just use the dictionary
    
    
    # returns the original, minus the shot dispersion data, which it has turned into a DF
    def process_last10_drives(self, last10):
        shot_dispersion_df = pd.DataFrame(last10.pop("shotDispersionDetails"))
        # last10.pop("longestShot")#drop for now, who cares, it's usually not right anyway
        return last10, shot_dispersion_df
    
    
    # similar to drives, keep a lot of the top level keys, return shotOrientationDetail as a DF and some of the insights
    def process_last10_approach(self, last10):
        app_insight = last10.pop("approachInsight")
        dist_range_insights_df = pd.DataFrame(app_insight["distRangeInsights"])
        club_insights_df = pd.DataFrame(app_insight["clubInsights"])
        shot_orientation_df = pd.DataFrame(last10.pop("shotOrientationDetail"))
        return last10, shot_orientation_df, dist_range_insights_df, club_insights_df
    
    # similar to drives and approach
    def process_last10_chip(self, last10):
        shot_orientation_df = pd.DataFrame(last10.pop("shotOrientationDetail"))
        return last10, shot_orientation_df
    
    
    def process_last10_putt(self, last10):
        return last10 #nothing to do here, use as a dictionary for now


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Parse Raw Garmin Golf Data.')
    general = parser.add_argument_group("general")
    general.add_argument("-i", '--input', default="golf-export.json", help='The input file to load and turn into CSVs')
    general.add_argument("-o", "--output", default="output",
                         help="The directory to write the output to.  Will create it if it doesn't exit")

    args = parser.parse_args()

    input = args.input
    output_dir = args.output
    if os.path.exists(input) == False:
        logging.info(f"Can't find {input}")
        exit(2)
    if os.path.isdir(output_dir) == False:
        os.mkdir(output_dir)
    gde = GarminDataExport(input)
    logging.info(f"GDE Data Keys: {gde.all_data.keys()}")
    # Write
    