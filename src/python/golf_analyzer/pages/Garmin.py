import streamlit as st
from acquisition.garmin.parse_garmin_data import GarminDataExport
from acquisition.garmin.garmin_acquisition import GarminAcquire
import logging

import psycopg2
from sqlalchemy import create_engine

# Get DB connection.
# Uses st.experimental_singleton to only run once.
@st.experimental_singleton
def get_database_connection():
    # return psycopg2.connect(**st.secrets["postgres"])
    url = f"postgresql+psycopg2://{st.secrets['postgres']['user']}:{st.secrets['postgres']['password']}@{st.secrets['postgres']['hostname']}/{st.secrets['postgres']['dbname']}"
    logging.info(f"DB URL: {url}")
    return create_engine(url, echo=True, future=True)


def garmin_fetch_data(username, password, javascript="./javascript/garmin-download-non-interactive.js"):
    ga = GarminAcquire()
    #TODO: this assumes local user
    storage = st.session_state.get('garmin_state', None)
    if storage is None:
        logging.info("Logging In")
        storage = ga.login(username, password, storage_to_disk=None)# don't write it to disk
        st.session_state['garmin_state'] = storage

    if storage is not None:
        with open(javascript, "r") as f:
            javascript = f.read()
            data = ga.acquire_data(javascript, storage)
            if data is not None:
                logging.info(f"Data acquired: {len(data)}")
                gde = GarminDataExport()
                gde.from_json_dict(data)
                return gde


def garmin_load_data(uploaded_file):
    gde = GarminDataExport()
    gde.from_bytes(uploaded_file.getvalue().decode("utf-8"))
    return gde


def write_to_database(gde):
    logging.info("Writing data to DB")
    engine = get_database_connection()
    gde.all_data["clubs"].to_sql("clubs", con=engine)
    


def garmin():


    st.write("# Connect to Garmin Connect")

    st.markdown(
        """
        To get started, either provide your Garmin credentials or upload a Garmin JSON Export file.  See the [README](https://github.com/gsingers/garmin_golf/blob/main/README.md) section on `Getting Data from Garmin`.
        
        In either case, your data will be stored to the configured database.  Future connections to Garmin will only download new data.
        """ # TODO: only download new scorecards and data!
    )
    gde = None
    with st.form("Garmin Login"):
        st.write("Please enter your Garmin Credentials")
        username = st.text_input("Garmin Username")
        password = st.text_input("Garmin Password", type="password")
        submitted = st.form_submit_button("Submit")
        if submitted:
            gde = garmin_fetch_data(username, password)
            add_gde_to_session(gde)



    uploaded_file = st.file_uploader("Garmin Export", type="json")
    if uploaded_file is not None:
        # To read file as bytes:
        try:
            gde = garmin_load_data(uploaded_file)
            add_gde_to_session(gde)
        except Exception as e:
            st.write(e)
            st.write("Sorry, we couldn't process your input file.  Please check the format.")

    if gde is not None:
        write_to_database(gde)
        # Can be used wherever a "file-like" object is accepted:
        #dataframe = pd.read_csv(uploaded_file)

def add_gde_to_session(gde):
    st.session_state['gde'] = gde
    st.write("We've succesfully processed the file.  Start exploring your data via the options on the side menu.")


gde = garmin()