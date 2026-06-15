import os
import requests

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("UMLS_API_KEY")

print("API KEY FOUND:", API_KEY is not None)

url = "https://uts-ws.nlm.nih.gov/rest/search/current"

params = {
    "string": "HTN",
    "apiKey": API_KEY
}

response = requests.get(
    url,
    params=params
)

print("Status:", response.status_code)

print(response.text[:500])