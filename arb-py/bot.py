#!/usr/bin/env python3
import asyncio
import argparse
import json
import re
import pathlib
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

root_env = pathlib.Path(__file__).resolve().parents[1] / ".env"
load_dotenv(root_env)


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
    filename = "accounts.csv"
    path = pathlib.Path(basedir) / filename
    if not path.exists():
        raise FileNotFoundError(f"{path} not found")

    with path.open("r", encoding="utf-8", newline="") as fh:
        sample = fh.read(4096)
        fh.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        except csv.Error:
            dialect = csv.get_dialect("excel")  # default comma
        reader = csv.DictReader(fh, dialect=dialect)
        return [row for row in reader]


def save_duck_alias_results(result: List[Dict[str, str]]) -> None:
    filename = "accounts.csv"
    path = pathlib.Path(basedir) / filename

    if not path.exists():
        raise FileNotFoundError(f"{path} not found")

    headers = [
        "Email",
        "EmailCreatedAt",
        "SDApiKey",
        "SDApiKeyCreatedAt",
        "SDApiKeyStatus",
        "SDApiKeyExhaustedAt",
    ]

    with path.open("a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        for row in result:
            new_row = {
                "Email": row["duck_email"],
                "EmailCreatedAt": row["email_created_at"],
                "SDApiKey": None,
                "SDApiKeyCreatedAt": None,
                "SDApiKeyStatus": None,
                "SDApiKeyExhaustedAt": None,
            }

            writer.writerow(new_row)


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


def generate_duck_aliases(count: int) -> List[Dict[str, str]]:
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


def update_accounts_data(data: Dict[str, str]) -> None:
    filename = "accounts.csv"
    path = pathlib.Path(basedir) / filename
    if not path.exists():
        raise FileNotFoundError(f"{path} not found")

    email = data["email"]
    sd_account_created_at = data["sd_account_created_at"]
    api_key = data["api_key"]
    sd_api_key_created_at = data["sd_api_key_created_at"]

    with open(path, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                email,
                sd_account_created_at,
                api_key,
                sd_api_key_created_at,
                None,
                None,
            ]
        )


def update_env_with_token(token: str) -> None:
    filename = ".env"
    path = pathlib.Path(basedir).parent / filename

    if not path.exists():
        raise FileNotFoundError(f"{path} not found")

    # Read current .env contents
    lines = path.read_text().splitlines()
    new_lines = []
    key_found = False

    for line in lines:
        if line.startswith("SPORTSDATAIO_API_KEY="):
            new_lines.append(f"SPORTSDATAIO_API_KEY={token}")
            key_found = True
        else:
            new_lines.append(line)

    # If not found, append it
    if not key_found:
        new_lines.append(f"SPORTSDATAIO_API_KEY={token}")

    # Write updated content back
    path.write_text("\n".join(new_lines) + "\n")


async def create_sportsdata_account(
    context: BrowserContext, genuine_email: bool, update_env: bool
) -> None:
    accounts = read_accounts()
    email = fake.email()

    if genuine_email:
        for row in accounts:
            if not row.get("SDApiKeyStatus"):
                email = row.get("Email")
                break

    logger.info(f"Using unused email {email}")

    if not email:
        raise ValueError("No unused account found in accounts.csv")

    page = await context.new_page()
    await page.goto("https://sportsdata.io/user/register")
    await page.fill("#Registration_FirstName", fake.first_name())
    await page.fill("#Registration_LastName", fake.last_name())
    await page.fill("#Registration_Email", fake.email())
    await page.fill("#Registration_Password", password)
    await page.fill("#Registration_ConfirmPassword", password)
    await page.check("#AgreedToTerms")
    await asyncio.sleep(1.0)
    await page.click("#submitButton")
    await page.wait_for_load_state("networkidle")
    await page.goto("https://sportsdata.io/free-trial")
    leagues = ["NFL", "MLB", "NBA", "NHL", "Golf", "Soccer"]

    for league in leagues:
        league_locator = page.locator("div.league-wrap").filter(has_text=league)
        await league_locator.first.click()
    await asyncio.sleep(1.0)

    await page.get_by_role("button", name="Continue").click()

    feeds = [
        "Competition Feeds",
        "Event Feeds",
        "Player Feeds",
        "Betting Feeds",
        "News & Images",
    ]

    for feed in feeds:
        feed_box = page.locator(
            f"span.ng-binding:has-text('{feed}') >> xpath=ancestor::div[@class='feed-type-box']"
        )
        await feed_box.click(force=True)
        await page.wait_for_timeout(300)

    await asyncio.sleep(1.0)
    await page.get_by_role("button", name="Continue").click()

    await page.check("#Form_SalesAssistanceRequested[value='False']")
    await page.check("#AgreedToTerms")
    await asyncio.sleep(1.0)
    await page.get_by_role("button", name="Finish").click()

    await page.wait_for_url("https://sportsdata.io/free-trial", timeout=10000)
    await asyncio.sleep(1.0)
    await page.goto("https://sportsdata.io/members/subscriptions")
    await asyncio.sleep(1.0)
    api_key = await page.evaluate(
        """() => {
            const link = document.querySelector("a[ng-click^='vm.copy_api_key']");
            const match = link?.getAttribute("ng-click")?.match(/'([a-f0-9]{32})'/);
            return match ? match[1] : "";
        }"""
    )
    await asyncio.sleep(1.0)
    sd_account_created_at = datetime.utcnow().isoformat()
    await page.close()

    if api_key:
        data = {
            "email": email,
            "sd_account_created_at": sd_account_created_at,
            "api_key": api_key,
            "sd_api_key_created_at": sd_account_created_at,
        }
        logger.info(f"Created SD Account {data}")

        update_accounts_data(data)
        if update_env:
            update_env_with_token(api_key)

    return None


async def launch_context(playwright, headless: bool):
    browser = await playwright.chromium.launch(
        channel="chrome", headless=headless
    )
    context = await browser.new_context()
    return context


async def run_step(
    step: str, headless: bool, count: int, genuine_email: bool, update_env: bool
):
    if step == "chrome":
        proc = launch_chrome(debug_port=9222)
        print(f"[✓] Chrome started (pid={proc.pid}) and ready on port 9222")
        return None

    async with async_playwright() as p:
        context = await launch_context(p, headless=headless)
        result = {}
        try:
            if step == "ddg":
                save_duck_alias_results(generate_duck_aliases(count))
            elif step == "sportdata":
                result = await create_sportsdata_account(
                    context, genuine_email, update_env
                )
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
        "--step", "-s", choices=["ddg", "sportdata", "chrome"], required=True
    )
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--use-extension", action="store_true")
    parser.add_argument("--alias-count", type=int, default=1)
    parser.add_argument("--genuine-email", action="store_true")
    parser.add_argument("--update-env", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    asyncio.run(
        run_step(
            args.step,
            args.headless,
            args.alias_count,
            args.genuine_email,
            args.update_env,
        )
    )


if __name__ == "__main__":
    main()
