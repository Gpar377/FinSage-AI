"""
CAMS / KFintech Statement Parser.
Extracts fund data from PDF statements.
Also handles manual JSON input for demo purposes.
"""

import re
from datetime import datetime, date
from typing import List, Dict

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False


def parse_cams_pdf(pdf_path: str) -> List[Dict]:
    """
    Parse CAMS/KFintech consolidated statement PDF.
    Returns list of fund records.
    """
    if not PDF_AVAILABLE:
        return []

    funds = []
    with pdfplumber.open(pdf_path) as pdf:
        full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    # Split by fund blocks
    fund_blocks = re.split(r'\n(?=[A-Z][A-Z\s]{10,}Fund)', full_text)

    for block in fund_blocks:
        fund = {}
        lines = block.strip().split('\n')
        if lines:
            fund["name"] = lines[0].strip()

        # Units
        m = re.search(r'Units.*?:\s*([\d,]+\.?\d*)', block)
        if m:
            fund["units"] = float(m.group(1).replace(",", ""))

        # NAV
        m = re.search(r'NAV.*?:\s*₹?\s*([\d,]+\.?\d*)', block)
        if m:
            fund["nav"] = float(m.group(1).replace(",", ""))

        # Current value
        m = re.search(r'Current.*?Value.*?:.*?₹?\s*([\d,]+\.?\d*)', block)
        if m:
            fund["current_value"] = float(m.group(1).replace(",", ""))

        # Dates
        dates = re.findall(r'\b(\d{2}-[A-Za-z]{3}-\d{4})\b', block)
        if dates:
            parsed_dates = []
            for d in dates:
                try:
                    parsed_dates.append(datetime.strptime(d, "%d-%b-%Y").date())
                except ValueError:
                    pass
            if parsed_dates:
                fund["purchase_date"] = str(min(parsed_dates))

        if fund.get("name") and (fund.get("units") or fund.get("current_value")):
            funds.append(fund)

    return funds


# ── Sample Data for Demo ────────────────────────────────────────────
# This represents the judge's test scenario: 6 MFs across 4 AMCs with overlap

SAMPLE_PORTFOLIO = [
    {
        "name": "HDFC Top 100 Fund - Regular",
        "amc": "HDFC AMC",
        "category": "Large Cap",
        "invested": 350000,
        "current_value": 428000,
        "purchase_date": "2023-03-15",
        "ter_regular": 0.0195,
        "ter_direct": 0.0104,
        "holdings": [
            {"stock": "Reliance Industries", "weight": 9.2},
            {"stock": "HDFC Bank", "weight": 8.8},
            {"stock": "Infosys", "weight": 7.5},
            {"stock": "ICICI Bank", "weight": 6.9},
            {"stock": "TCS", "weight": 5.8},
            {"stock": "Bharti Airtel", "weight": 4.2},
            {"stock": "ITC", "weight": 3.8},
            {"stock": "L&T", "weight": 3.5},
            {"stock": "Kotak Bank", "weight": 3.1},
            {"stock": "SBI", "weight": 2.9},
        ]
    },
    {
        "name": "ICICI Pru Bluechip Fund - Regular",
        "amc": "ICICI Pru AMC",
        "category": "Large Cap",
        "invested": 280000,
        "current_value": 342000,
        "purchase_date": "2023-06-20",
        "ter_regular": 0.0183,
        "ter_direct": 0.0089,
        "holdings": [
            {"stock": "Reliance Industries", "weight": 8.5},
            {"stock": "HDFC Bank", "weight": 7.9},
            {"stock": "Infosys", "weight": 6.8},
            {"stock": "ICICI Bank", "weight": 6.2},
            {"stock": "TCS", "weight": 5.5},
            {"stock": "HUL", "weight": 4.1},
            {"stock": "Bharti Airtel", "weight": 3.9},
            {"stock": "Axis Bank", "weight": 3.2},
            {"stock": "Maruti Suzuki", "weight": 2.8},
            {"stock": "Sun Pharma", "weight": 2.5},
        ]
    },
    {
        "name": "SBI Bluechip Fund - Regular",
        "amc": "SBI AMC",
        "category": "Large Cap",
        "invested": 200000,
        "current_value": 238000,
        "purchase_date": "2024-01-10",
        "ter_regular": 0.0175,
        "ter_direct": 0.0082,
        "holdings": [
            {"stock": "Reliance Industries", "weight": 8.8},
            {"stock": "Infosys", "weight": 7.2},
            {"stock": "HDFC Bank", "weight": 6.5},
            {"stock": "TCS", "weight": 5.9},
            {"stock": "ICICI Bank", "weight": 5.4},
            {"stock": "Bharti Airtel", "weight": 4.5},
            {"stock": "ITC", "weight": 3.6},
            {"stock": "L&T", "weight": 3.3},
            {"stock": "Bajaj Finance", "weight": 2.9},
            {"stock": "Kotak Bank", "weight": 2.7},
        ]
    },
    {
        "name": "Mirae Asset Emerging Bluechip - Regular",
        "amc": "Mirae Asset AMC",
        "category": "Large & Mid Cap",
        "invested": 250000,
        "current_value": 312000,
        "purchase_date": "2023-09-05",
        "ter_regular": 0.0178,
        "ter_direct": 0.0069,
        "holdings": [
            {"stock": "HDFC Bank", "weight": 5.2},
            {"stock": "ICICI Bank", "weight": 4.8},
            {"stock": "Reliance Industries", "weight": 4.5},
            {"stock": "Infosys", "weight": 3.9},
            {"stock": "PI Industries", "weight": 3.2},
            {"stock": "Persistent Systems", "weight": 2.9},
            {"stock": "Coforge", "weight": 2.5},
            {"stock": "Crompton Greaves", "weight": 2.3},
            {"stock": "Voltas", "weight": 2.1},
            {"stock": "Escorts", "weight": 1.9},
        ]
    },
    {
        "name": "Axis Midcap Fund - Regular",
        "amc": "Axis AMC",
        "category": "Mid Cap",
        "invested": 180000,
        "current_value": 215000,
        "purchase_date": "2024-02-15",
        "ter_regular": 0.0192,
        "ter_direct": 0.0058,
        "holdings": [
            {"stock": "Persistent Systems", "weight": 4.5},
            {"stock": "PI Industries", "weight": 3.8},
            {"stock": "Coforge", "weight": 3.2},
            {"stock": "Voltas", "weight": 2.9},
            {"stock": "Max Healthcare", "weight": 2.7},
            {"stock": "Crompton Greaves", "weight": 2.4},
            {"stock": "Cholamandalam", "weight": 2.2},
            {"stock": "Tube Investments", "weight": 2.0},
            {"stock": "APL Apollo", "weight": 1.8},
            {"stock": "CG Power", "weight": 1.6},
        ]
    },
    {
        "name": "Parag Parikh Flexi Cap Fund - Regular",
        "amc": "PPFAS AMC",
        "category": "Flexi Cap",
        "invested": 320000,
        "current_value": 405000,
        "purchase_date": "2022-11-20",
        "ter_regular": 0.0163,
        "ter_direct": 0.0063,
        "holdings": [
            {"stock": "HDFC Bank", "weight": 5.8},
            {"stock": "ICICI Bank", "weight": 4.5},
            {"stock": "Bajaj Holdings", "weight": 3.9},
            {"stock": "ITC", "weight": 3.5},
            {"stock": "Alphabet (Google)", "weight": 5.2},
            {"stock": "Microsoft", "weight": 4.8},
            {"stock": "Amazon", "weight": 3.6},
            {"stock": "Coal India", "weight": 2.8},
            {"stock": "Power Grid", "weight": 2.4},
            {"stock": "NMDC", "weight": 2.0},
        ]
    },
]


def get_sample_portfolio() -> List[Dict]:
    """Return sample portfolio for demo."""
    return SAMPLE_PORTFOLIO
