#!/usr/bin/env python3
import asyncio
import argparse
import json
import re
import os
import httpx
import csv
import sys
import logging
import socket
import subprocess
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from playwright.async_api import async_playwright, BrowserContext
from faker import Faker

load_dotenv()


fake = Faker()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("sportdata.log"),
    ],
)

logger = logging.getLogger(__name__)


password = "Password12345*"
ddg_extension_id = "bkdgflcldnnnapblkhphbgpggdiikppg"
basedir = os.path.abspath(os.path.dirname(__file__))
email_pattern = re.compile(r"[a-z0-9._%+-]+@duck\.com", re.IGNORECASE)


def read_accounts() -> List[Dict[str, str]]:
    file = os.path.join(basedir, "accounts.csv")
    if not os.path.exists(file):
        raise FileNotFoundError(f"{file} not found")
    with open(file, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        rows = [row for row in reader]
    return rows


def launch_chrome(debug_port: int = 9222):
    profile_dir = os.path.join(basedir, "Chrome/Default")
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    cmd = [
        chrome_path,
        f"--remote-debugging-port={debug_port}",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={profile_dir}",
    ]

    print(cmd)

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Wait until Chrome opens the debugging port
    for _ in range(60):  # wait up to ~12 seconds
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.settimeout(0.2)
                s.connect(("127.0.0.1", debug_port))
                logger.info(
                    f"[✓] Chrome is running and listening on port {debug_port}"
                )
                return proc
            except (ConnectionRefusedError, OSError):
                time.sleep(0.2)

    raise RuntimeError(
        f"Chrome did not open remote debugging port {debug_port} in time"
    )


def generate_duck_aliases(count: int = 5):
    delay = 2.0
    url = "https://quack.duckduckgo.com/api/email/addresses"
    token = os.environ["DUCK_MAIL_TOKEN"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    results = []
    for i in range(count):
        response = httpx.post(url, headers=headers)
        data = response.json()
        alias = data.get("address")
        email = f"{alias}@duck.com" if alias else None
        if not email:
            logger.warning("No mail alias returned")
            continue
        result = {
            "duck_email": email,
            "email_created_at": datetime.utcnow().isoformat(),
        }
        results.append(result)
        logger.debug(f"[{i+1}/{count}] {email}")
        time.sleep(delay)

    return results


async def create_sportsdata_account(context: BrowserContext) -> Dict[str, Any]:
    accounts = read_accounts()
    email = None
    for row in accounts:
        if row.get("Status") == "Unused":
            email = row.get("Email")
            break

    logger.info(f"Using unused email {email}")

    if not email:
        raise ValueError("No unused account found in accounts.tsv")
    page = await context.new_page()
    await page.goto("https://sportsdata.io/user/register")
    await page.fill("#Registration_FirstName", fake.first_name())
    await page.fill("#Registration_LastName", fake.last_name())
    await page.fill("#Registration_Email", email)
    await page.fill("#Registration_Password", password)
    await page.fill("#Registration_ConfirmPassword", password)
    await page.check("#AgreedToTerms")
    await page.click("#submitButton")
    await page.wait_for_load_state("networkidle")
    await page.goto("https://sportsdata.io/free-trial")
    leagues = ["NFL", "MLB", "NBA", "NHL", "Golf", "Soccer"]
    for league in leagues:
        try:
            await page.get_by_text(league, exact=True).click()
        except Exception:
            pass
    try:
        await page.get_by_role("button", name="Continue").click()
    except Exception:
        pass
    feeds = [
        "Competition Feeds",
        "Event Feeds",
        "Player Feeds",
        "Betting Feeds",
        "News & Images",
    ]
    for feed in feeds:
        try:
            await page.get_by_text(feed, exact=True).click()
        except Exception:
            pass
    try:
        await page.get_by_role("button", name="Continue").click()
    except Exception:
        pass
    try:
        await page.check("#Form_SalesAssistanceRequested[value='False']")
        await page.check("#AgreedToTerms")
        await page.get_by_role("button", name="Finish").click()
    except Exception:
        pass
    try:
        await page.wait_for_url(
            "https://sportsdata.io/free-trial", timeout=10000
        )
    except Exception:
        pass
    await page.goto("https://sportsdata.io/members/subscriptions")
    api_key = ""
    try:
        api_key = await page.evaluate(
            """() => {
                const link = document.querySelector("a[ng-click^='vm.copy_api_key']");
                const match = link?.getAttribute("ng-click")?.match(/'([a-f0-9]{32})'/);
                return match ? match[1] : "";
            }"""
        )
    except Exception:
        pass
    sd_account_created_at = datetime.utcnow().isoformat()
    await page.close()
    return {
        "email": email,
        "sd_account_created_at": sd_account_created_at,
        "api_key": api_key,
    }


async def launch_context(playwright, headless: bool):
    browser = await playwright.chromium.launch(
        channel="chrome", headless=headless
    )
    context = await browser.new_context()
    return context


async def run_step(step: str, headless: bool, count: int = 1):
    if step == "chrome":
        proc = launch_chrome(debug_port=9222)
        print(f"[✓] Chrome started (pid={proc.pid}) and ready on port 9222")
        return None

    async with async_playwright() as p:
        context = await launch_context(p, headless=headless)
        result = {}
        try:
            if step == "ddg":
                result = generate_duck_aliases(count)
            elif step == "sdio":
                result = await create_sportsdata_account(context)
        finally:
            try:
                await context.close()
            except Exception:
                pass
        print(json.dumps(result, indent=2))
        return result


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--step", "-s", choices=["ddg", "sdio", "chrome"], required=True
    )
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--use-extension", action="store_true")
    parser.add_argument("--alias-count", type=int, default=1)
    return parser.parse_args()


def main():
    args = parse_args()
    asyncio.run(run_step(args.step, args.headless, args.alias_count))


if __name__ == "__main__":
    main()
