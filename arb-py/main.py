import asyncio
import os
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def clean_html(html_content: str) -> str:
    """Remove all JS/CSS and related attributes from HTML."""
    soup = BeautifulSoup(html_content, "html.parser")

    # Remove script, style, noscript, and meta tags for good measure
    for tag in soup(["script", "style", "noscript", "meta"]):
        tag.decompose()

    # Remove all link tags that reference CSS
    for link in soup.find_all("link", rel=lambda x: x and "stylesheet" in x.lower()):
        link.decompose()

    # Strip inline event handlers and style attributes
    for tag in soup(True):  # True = all tags
        attrs = dict(tag.attrs)
        for attr in list(attrs):
            if attr.startswith("on") or attr == "style":  # onclick, onload, etc.
                del tag.attrs[attr]

    return str(soup)


async def fetch_espn_game_data():
    """Fetch ESPN MLB game page and extract structured data using OpenAI."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            print("Navigating to ESPN MLB game page...")
            await page.goto('https://www.espn.com/mlb/game/_/gameId/401809270', wait_until='domcontentloaded')
            await page.wait_for_timeout(3000)
            
            # Get all page content
            html_content = await page.content()
            
            # Clean HTML (remove CSS and JavaScript)
            cleaned_html = clean_html(html_content)

            print(cleaned_html)

            raise Exception
            
            print("Sending cleaned HTML to OpenAI for structured data extraction...")
            
            # Create the prompt
            prompt = f"""# Context 
You are an expert at deriving structure data from unstructured input

# Request 
You're given raw HTML of a MLB sports game, I need you to return as much of the baseball related
data as possible in a python dict. This includes ALL data that might be relevant to the state of 
the game: inning, score, hits, errors, strikes, balls, players, pitchers, etc.

# Constraints
- Return a python dict (or json, doesn't matter)
- Do not hallucinate stats, if you can't find something - use "null"
- Remember this is MLB league, so look for baseball stats
- Pretty much all stats should be in the unstructured HTML

Your unstructure HTML input is: {cleaned_html}

Please return the output"""

            # Send to OpenAI
            response = client.chat.completions.create(
                model="gpt-5o",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            print("\n" + "="*80)
            print("OPENAI RESPONSE")
            print("="*80)
            print(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error occurred: {e}")
        
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(fetch_espn_game_data())
