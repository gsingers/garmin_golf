import streamlit as st
import os
import logging


logging.basicConfig(level=logging.INFO)




def intro():
    st.write("# Welcome to the Golf Analyzer 👋")

    st.markdown(
        """
        To get started, load some data from a data source, such as Garmin.
        """
    )


golf = intro()
