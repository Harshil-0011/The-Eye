import io
import json
import pandas as pd
import pdfplumber
import trafilatura
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple

class FileExtractor:
    @staticmethod
    def extract_csv(file_bytes: bytes) -> List[Dict[str, Any]]:
        df = pd.read_csv(io.BytesIO(file_bytes))
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")

    @staticmethod
    def extract_excel(file_bytes: bytes) -> List[Dict[str, Any]]:
        df = pd.read_excel(io.BytesIO(file_bytes))
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")

    @staticmethod
    def extract_json(file_bytes: bytes) -> List[Dict[str, Any]]:
        data = json.loads(file_bytes.decode('utf-8'))
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        return []

    @staticmethod
    def extract_pdf(file_bytes: bytes) -> Dict[str, Any]:
        text_content = []
        tables = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
                extracted_tables = page.extract_tables()
                for table in extracted_tables:
                    tables.append(table)

        full_text = "\n\n".join(text_content)
        return {
            "text": full_text,
            "tables": tables
        }

    @staticmethod
    def extract_html(file_bytes_or_text: Any) -> Dict[str, Any]:
        if isinstance(file_bytes_or_text, bytes):
            html_text = file_bytes_or_text.decode('utf-8', errors='ignore')
        else:
            html_text = file_bytes_or_text

        extracted_text = trafilatura.extract(html_text)
        soup = BeautifulSoup(html_text, 'html.parser')
        title = soup.title.string if soup.title else "Untitled Document"

        return {
            "title": title,
            "text": extracted_text or soup.get_text(separator="\n", strip=True)
        }


class SchemaMapper:
    @staticmethod
    def infer_column_types(sample_records: List[Dict[str, Any]]) -> Dict[str, str]:
        if not sample_records:
            return {}

        type_mapping = {}
        first_row = sample_records[0]
        for key in first_row.keys():
            key_lower = str(key).lower()
            if any(k in key_lower for k in ["name", "person", "org", "company", "title", "author"]):
                type_mapping[key] = "entity_name"
            elif any(k in key_lower for k in ["date", "time", "created", "timestamp"]):
                type_mapping[key] = "event_date"
            elif any(k in key_lower for k in ["type", "category", "role"]):
                type_mapping[key] = "entity_type"
            elif any(k in key_lower for k in ["link", "url", "email", "domain"]):
                type_mapping[key] = "identifier"
            else:
                type_mapping[key] = "property"

        return type_mapping

    @staticmethod
    def map_record_to_canonical(
        record: Dict[str, Any],
        mappings: Dict[str, str]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        entities = []
        events = []

        entity_name = None
        entity_type = "PERSON"
        aliases = []
        props = {}

        event_title = None
        event_date = None

        for col, target in mappings.items():
            val = record.get(col)
            if val is None:
                continue

            if target == "entity_name":
                entity_name = str(val)
            elif target == "entity_type":
                entity_type = str(val).upper()
            elif target == "alias":
                aliases.append(str(val))
            elif target == "event_title":
                event_title = str(val)
            elif target == "event_date":
                event_date = str(val)
            else:
                props[col] = val

        if not entity_name and "name" in record:
            entity_name = str(record["name"])

        if entity_name:
            entities.append({
                "name": entity_name,
                "type": entity_type if entity_type in ["PERSON", "ORGANIZATION", "PRODUCT", "TOPIC", "LOCATION", "OTHER"] else "PERSON",
                "aliases": aliases,
                "properties": props
            })

        if event_title or "title" in record:
            events.append({
                "title": event_title or record.get("title", "Ingested Event"),
                "date": event_date or record.get("date"),
                "category": record.get("category", "General"),
                "properties": props
            })

        return entities, events

import time
import urllib.robotparser
from urllib.parse import urlparse
import requests

class WebScraper:
    """
    Web scraper respecting robots.txt and enforcing per-domain rate limits.
    """
    _last_request_times: Dict[str, float] = {}
    _robot_parsers: Dict[str, urllib.robotparser.RobotFileParser] = {}
    MIN_REQUEST_INTERVAL = 1.0  # seconds between requests to same domain

    @classmethod
    def can_fetch(cls, url: str, user_agent: str = "TheEyeBot/1.0") -> bool:
        parsed = urlparse(url)
        domain = parsed.netloc
        robots_url = f"{parsed.scheme}://{domain}/robots.txt"

        if domain not in cls._robot_parsers:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            try:
                rp.read()
            except Exception:
                pass
            cls._robot_parsers[domain] = rp

        return cls._robot_parsers[domain].can_fetch(user_agent, url)

    @classmethod
    def fetch_page(cls, url: str, user_agent: str = "TheEyeBot/1.0") -> Tuple[bool, str]:
        if not cls.can_fetch(url, user_agent):
            return False, "Access disallowed by robots.txt"

        parsed = urlparse(url)
        domain = parsed.netloc

        # Rate limiting
        now = time.time()
        last_time = cls._last_request_times.get(domain, 0.0)
        elapsed = now - last_time
        if elapsed < cls.MIN_REQUEST_INTERVAL:
            time.sleep(cls.MIN_REQUEST_INTERVAL - elapsed)

        cls._last_request_times[domain] = time.time()

        headers = {"User-Agent": user_agent}
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                return True, resp.text
            return False, f"HTTP Error {resp.status_code}"
        except Exception as e:
            return False, str(e)
