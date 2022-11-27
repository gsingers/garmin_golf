import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# your clubs and data associated with them
class Club(Base):
    __tablename__= "club"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    club_type_id = Column(Integer)
    shaft_length = Column(Float)
    flex_type_id = Column(String, default="REGULAR")# make an enum?
    average_distance = Column(Float)
    advice_distance = Column(Float)
    retired = Column(Boolean)
    deleted = Column(Boolean)
    last_modified_time = Column(DateTime)
    # Club stats appear to be 1-1, so why have a separate object?
    #club_stats = relationship("ClubStats", back_populates="club")
    cs_id = Column(Integer)
    cs_average_distance = Column(Float)
    cs_max_lifetime_distance = Column(Float)
    cs_shots_count = Column(Integer)
    cs_percent_fairway_hit = Column(Float)
    cs_percent_fairway_left = Column(Float)
    cs_percent_fairway_right = Column(Float)
    cs_percent_green_hit = Column(Float)
    cs_percent_green_miss_left = Column(Float)
    cs_percent_green_long = Column(Float)
    cs_percent_green_right = Column(Float)
    cs_percent_green_short = Column(Float)
    cs_last_modified_time = Column(DateTime)


#class ClubStats(Base):
#    __tablename__ = "club_stats"
#    id = Column(Integer, primary_key=True)
#    club = relationship("club_stats", back_populates="club_stats")

class ScorecardSummary(Base):
    __tablename__="scorecard_summary"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer)
    player_profile_id = Column(Integer)
    score_type = Column(String)
    course_name = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    round_in_progress = Column(Boolean)
    strokes = Column(Integer)
    handicapped_strokes = Column(Integer)
    score_with_handicap = Column(Integer)
    score_without_handicap = Column(Integer)
    holes_completed = Column(Integer, default=18)
    round_type = Column(String)


class ScorecardDetails(Base):
    __tablename__="scorecard_details"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer)
    player_profile_id = Column(Integer)
    round_player_name = Column(String)
    connect_display_name = Column(String)
    course_global_id = Column(Integer)
    course_snapshot_id = Column(Integer)
    front_nine_global_course_id = Column(Integer)
    score_type = Column(String)
    use_handicap_scoring = Column(Boolean)
    use_stroke_counting = Column(Boolean)
    distance_walked = Column(Float)
    steps_taken = Column(Integer)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    unit_id = Column(Integer)
    round_type = Column(String)
    in_progress = Column(Boolean)
    exclude_from_stats = Column(False)
    holes_completed = Column(Integer, default=18)
    public_round = Column(Boolean)
    score = Column(Float) # what is this?  Should it be int?
    player_handicap = Column(Float)
    course_handicap_str = Column(String)
    tee_box = Column(String)
    handicap_type = Column(String)
    tee_box_rating = Column(Float)
    tee_box_slope = Column(Float)
    last_modified_date = Column(DateTime)
    sensor_on_putter = Column(Boolean)
    handicapped_strokes = Column(Integer)
    strokes = Column(Integer)





class Shot(Base):
    __tablename__="shot"

class Hole(Base):
    __tablename__="hole"
    number = Column(Integer)
    strokes = Column(Integer)
    handicap_score = Column(Integer)
    last_modified_date = Column(DateTime)
    fairway_shot_outcome = Column(String)
    #https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/278104/golf-shot-latitude-and-longitude-coordinate-system/1335743#1335743
    # https://www.gps-forums.com/threads/explanation-sought-concerning-gps-semicircles.1072/
    # https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php
    # Lat/Long in Garmin world is stored as "number of semicircles"
    pin_position_latitude = Column(Integer)
    pin_position_longitude = Column(Integer)
    scorecard_id = Column(Integer)
    course_name = Column(String)
    course_global_id = Column(Integer)
    par = Column(Integer)
    relative_to_par = Column(Integer)

class User(Base):
    __tablename__="User"

# Store Garmin credentials encrypted for easy future login
class GarminUser(Base):
    __tablename__="garmin_user"