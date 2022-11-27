import streamlit as st
import pandas as pd

gde = st.session_state.get('gde', None)
if gde is not None:
    st.set_page_config(page_title="Scorecards")
    st.markdown("# Scorecards")
    scorecards = gde.all_data['cards']
    st.dataframe(scorecards[["id", "holesCompleted", "playerHandicap", "teeBox", "strokes", "fairwaysHit", "fairwaysRight", "fairwaysLeft",
                            "greensInRegulation", "putts", "holesPar", "holesBogey", "holesOverBogey",
                            "holesBirdie", "holesEagle"]], width=1200, height=1000)


else:
    st.write("Please go back to the home page to load a input file first")