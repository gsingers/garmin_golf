from playwright.sync_api import Page, expect, sync_playwright as sp
import logging
import click
import os
import codecs
import tempfile
import json
logging.basicConfig(level=logging.INFO)

class GarminAcquire:


    def __init__(self) -> None:
        super().__init__()

    # storage_to_disk -- If None, don't store login state to disk.  If not None, then a path as to where to store state
    def login(self, username, password, storage_to_disk="state.json", login_url = "https://connect.garmin.com/signin"):
        with sp() as p:
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()
            context = browser.new_context()
            try:
                page.context.tracing.start(screenshots=True, snapshots=True, sources=True)
                response = page.goto(login_url)
                #TODO: check status
                page.frame_locator("#gauth-widget-frame-gauth-widget").locator("input[name=\"username\"]").click()
                # Fill input[name="username"]
                page.frame_locator("#gauth-widget-frame-gauth-widget").locator("input[name=\"username\"]").fill(username)
                # Fill input[name="password"]
                page.frame_locator("#gauth-widget-frame-gauth-widget").locator("input[name=\"password\"]").fill(password)
                # Click button:has-text("Sign In")
                page.frame_locator("#gauth-widget-frame-gauth-widget").locator("button:has-text(\"Sign In\")").click()
                page.wait_for_url("https://connect.garmin.com/modern/")
                page.wait_for_selector("text=Golf ScorecardsPerformance StatsCourse StatsLeaderboardsSwing Analysis >> span")
                #logging.info("Writing login state to state.json")
                storage = page.context.storage_state(path=storage_to_disk)
                return storage
            finally:
                page.context.tracing.stop(path="signin-trace.zip")
                context.close()
                browser.close()


    # storage_from_disk -- See https://playwright.dev/python/docs/api/class-browser#browser-new-context, either a path or a dict.
    def acquire_data(self, javascript, storage_from_disk=None, stats_url="https://connect.garmin.com/modern/golf-stats"):

        with sp() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(storage_state=storage_from_disk)
            page = context.new_page()
            try:
                page.context.tracing.start(screenshots=True, snapshots=True, sources=True)
                page.goto(stats_url)
                page.wait_for_url(stats_url, wait_until="networkidle")
                #storage = page.context.storage_state(path="state.json")
                #context = browser.new_context(storage_state="state.json")
                # Are we on a logged in page
                #logging.info(f"JS: {javascript}")
                page.evaluate(javascript)
                page.wait_for_selector("#score_output", timeout=0)
                the_text = page.text_content("#score_output")
                the_data = json.loads(the_text)
                # Temp write the file
                with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt") as fp:
                    logging.info(f"Writing file to temp: {fp.name}")
                    fp.write(the_text)
                return the_data
            finally:
                page.context.tracing.stop(path="trace-stats.zip")
                context.close()
                browser.close()




@click.command()
@click.option("--username", required=True, help="Your Garmin Username")
@click.password_option()

@click.option("--javascript", default="./javascript/garmin-download-non-interactive.js", help="The path to the Garmin Javascript downloader.  Default assumes you are running from one directory up")
def main(username, password, javascript):
    ga = GarminAcquire()
    with open(javascript, "r") as f:
        javascript = f.read()
        #logging.info(f"Javascript: {javascript}")
        if os.path.exists("state.json") == False:
            logging.info("Logging In")
            ga.login(username, password)
        golf_data = ga.acquire_data(javascript)