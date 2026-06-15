from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routes.home import router as home_router

import pdfplumber
import ollama
import re
import json
import os
import requests

from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

UMLS_API_KEY = os.getenv("UMLS_API_KEY" )
# ==================================
# CORS
# ==================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================
# REQUEST MODEL
# ==================================

class TextRequest(BaseModel):
    text: str

class LookupRequest(BaseModel):
    abbreviation: str
  
# ==================================
# FIND ABBREVIATIONS
# ==================================

def find_abbreviations(text):

    abbreviations = re.findall(
        r"\b[A-Z]{2,10}\b",
        text
    )

    return list(set(abbreviations))

# ==================================
# OLLAMA EXPANSION
# ==================================

def expand_with_ollama(text):

    abbreviations = find_abbreviations(text)

    print("\nDetected Abbreviations:")
    print(abbreviations) 

    prompt = f"""
You are a clinical abbreviation expansion system.

Clinical Text:
{text}

Detected Abbreviations:
{abbreviations}

Use the surrounding clinical context to determine the correct expansion.
1. Preserve the original sentence structure.
2. Do NOT summarize.
3. Do NOT remove information.
4. Replace every abbreviation with its full form.
5. Keep all original sentences.
6. Do NOT keep abbreviations in parentheses.
7. Do NOT leave abbreviations unchanged.
8. Every detected abbreviation MUST appear in mappings.
9. The number of mappings MUST equal the number of detected abbreviations.
10. Every abbreviation must be expanded in expanded_text.
11. Return ONLY valid JSON.

JSON FORMAT:

{{
  "expanded_text": "...",
  "mappings": [
    {{
      "abbr": "HTN",
      "meaning": "Hypertension"
    }}
  ]
}}
"""
    response = ollama.chat(
        model="mistral",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response["message"]["content"]

    print("\nOLLAMA RESPONSE:\n")
    print(content)

    try:

        json_match = re.search(
            r"\{.*\}",
            content,
            re.DOTALL
        )

        if json_match:

            result = json.loads(
                json_match.group()
            )

            return {
                "expanded_text": result.get(
                    "expanded_text",
                    text
                ),

                "mappings": result.get(
                    "mappings",
                    []
                )
            }

    except Exception as e:

        print("\nJSON ERROR:")
        print(e)

    return {
        "expanded_text": content,
        "mappings": []
    }

app.include_router(home_router)

# ==================================
# TEXT INPUT
# ==================================

@app.post("/expand")
def expand_text(data: TextRequest):

    return expand_with_ollama(
        data.text
    )

# ==================================
# PDF INPUT
# ==================================

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):

    extracted_text = ""

    temp_file = file.filename

    with open(
        temp_file,
        "wb"
    ) as buffer:

        content = await file.read()

        buffer.write(content)

    with pdfplumber.open(
        temp_file
    ) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:

                extracted_text += (
                    page_text + "\n"
                )

    result = expand_with_ollama(
        extracted_text
    )

    return {

        "extracted_text":
        extracted_text,

        "expanded_text":
        result["expanded_text"],

        "mappings":
        result["mappings"]
    }
    

# ==================================
# SEARCH UMLS
# ==================================

def search_umls(abbreviation):

    url = (
        "https://uts-ws.nlm.nih.gov/"
        "rest/search/current"
    )

    response = requests.get(
        url,
        params={
            "string": abbreviation,
            "apiKey": UMLS_API_KEY
        }
    )

    if response.status_code != 200:
        return None

    data = response.json()

    results = data["result"]["results"]

    if len(results) == 0:
        return None

    first = results[0]

    semantic_types = first.get(
        "semanticTypes",
        []
    )

    semantic_type = (
        semantic_types[0]
        if semantic_types
        else "Unknown"
    )

    return {
        "expansion":
        first.get("name"),

        "semantic_type":
        semantic_type
    }



# ==================================
# MANUAL LOOKUP USING UMLS
# ==================================

@app.post("/lookup-abbreviation")
def lookup_abbreviation(
    data: LookupRequest
):

    result = search_umls(
        data.abbreviation
    )

    if not result:

        return {
            "found": False,
            "message":
            "No result found"
        }

    return {

        "found": True,

        "abbreviation":
        data.abbreviation,

        "expansion":
        result["expansion"],

        "semantic_type":
        result["semantic_type"]
    }
