import streamlit as st
import pandas as pd
import datetime as dt

gde = st.session_state.get('gde', None)
if gde is not None:
    #now = dt.datetime.now()
    #prior_30d = now - dt.timedelta(days=30)
    #prior_60d = now - dt.timedelta(days=60)
    st.set_page_config(page_title="Big Picture")
    st.markdown("# Big Picture")
    scorecards = gde.all_data['cards']
    clubs = gde.all_data['clubs']
    graphs_tab, stats_tab, course_data_tab, club_data_tab = st.tabs(["Graphs", "Rounds Stats", "Course Stats",
                                                                                    "Club Stats"])
    stats_tab.write("## Rounds Stats")
    col1, col2, col3, col4 = stats_tab.columns(4)
    col1.write(f"*Number of Rounds*: {len(scorecards)}")
    col1.write(f"*Total Steps*: {int(scorecards['stepsTaken'].sum()):,}")
    col1.write(f"*Total Distance*: {int(scorecards['distanceWalked'].sum()):,}")
    col1.write(f"*Total Shots Taken*: {scorecards['strokes'].sum():,}")
    col2.write(f"*Average Score*: {scorecards['strokes'].mean():.2f}")
    completed_18 = scorecards[scorecards['holesCompleted'] == 18]
    last_30_d = pd.Timedelta("30 days")
    last_60_d = pd.Timedelta("60 days")
    last30_18 = completed_18[completed_18['startTime'] >= last_30_d]
    col2.write(f"*Average Last 30*: {last30_18['strokes'].mean():.2f}")
    last60_18 = completed_18[completed_18['startTime'] >= prior_60d]
    col2.write(f"*Min Score(18)*: {completed_18['strokes'].min():,}")
    col2.write(f"*Max Score(18)*: {completed_18['strokes'].max():,}")

    # Temp
    stats_tab.dataframe(scorecards)
    stats_tab.code(str(scorecards.dtypes))

    

else:
    st.write("Please go back to the home page to load a input file first")