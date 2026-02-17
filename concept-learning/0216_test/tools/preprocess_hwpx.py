#!/usr/bin/env python3
"""
Preprocess all HWPX files in the repository root into:
1) raw text files under cbi_logs/curriculum_raw
2) structured JSON indices under cbi_logs/curriculum_index

Usage:
  python tools/preprocess_hwpx.py
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


UNIT_RE = re.compile(r"\((\d{1,2})\)\s*([^\n\[]{1,80})")
CODE_RE = re.compile(r"\[([^\]\n]{2,20}-\d{2})\]")


@dataclass
class Unit:
    no: int
    title: str
    pos: int


@dataclass
class Standard:
    code: str
    text: str
    grade_hint: str
    pos: int
    unit_no: int | None
    unit_title: str | None


def guess_subject(stem: str) -> str:
    s = stem.lower()
    if "science" in s or "과학" in stem:
        return "과학"
    if "society" in s or "social" in s or "사회" in stem:
        return "사회"
    if "math" in s or "수학" in stem:
        return "수학"
    return stem


def extract_hwpx_text(hwpx_path: Path) -> str:
    with zipfile.ZipFile(hwpx_path) as zf:
        section_files = sorted(
            n for n in zf.namelist() if n.startswith("Contents/section") and n.endswith(".xml")
        )
        if not section_files:
            return ""

        chunks: list[str] = []
        for section in section_files:
            xml_bytes = zf.read(section)
            root = ET.fromstring(xml_bytes)
            for elem in root.iter():
                if elem.tag.endswith("}t") and elem.text:
                    t = elem.text.strip()
                    if t:
                        chunks.append(t)
        return "\n".join(chunks)


def parse_units(text: str) -> list[Unit]:
    units: list[Unit] = []
    seen: set[tuple[int, str]] = set()
    for m in UNIT_RE.finditer(text):
        no = int(m.group(1))
        title = re.sub(r"\s+", " ", m.group(2)).strip()
        key = (no, title)
        if key in seen:
            continue
        seen.add(key)
        units.append(Unit(no=no, title=title, pos=m.start()))
    units.sort(key=lambda x: x.pos)
    return units


def grade_hint_from_code(code: str) -> str:
    m = re.match(r"(\d+)", code)
    return m.group(1) if m else ""


def nearest_unit(units: list[Unit], pos: int) -> Unit | None:
    # Units are sorted by position; return the nearest preceding unit.
    prev: Unit | None = None
    for unit in units:
        if unit.pos <= pos:
            prev = unit
        else:
            break
    return prev


def parse_standards(text: str, units: list[Unit]) -> list[Standard]:
    standards: list[Standard] = []
    seen_codes: set[str] = set()

    for m in CODE_RE.finditer(text):
        code = m.group(1).strip()
        if code in seen_codes:
            continue

        # Capture sentence-like tail; some standards have text on next line(s).
        tail_start = m.end()
        window = text[tail_start : tail_start + 500]
        lines: list[str] = []
        for raw_line in window.splitlines():
            line = re.sub(r"\s+", " ", raw_line).strip()
            if not line:
                # Skip leading or mid blank lines.
                continue
            if line.startswith("[") or line.startswith("<"):
                # Next standard / section marker.
                break
            lines.append(line)
            if len(lines) >= 3 or line.endswith(("다.", ".", "한다.")):
                break
        sentence = " ".join(lines).strip()

        unit = nearest_unit(units, m.start())
        standards.append(
            Standard(
                code=code,
                text=sentence,
                grade_hint=grade_hint_from_code(code),
                pos=m.start(),
                unit_no=unit.no if unit else None,
                unit_title=unit.title if unit else None,
            )
        )
        seen_codes.add(code)

    standards.sort(key=lambda x: x.pos)
    return standards


def to_jsonable_units(units: Iterable[Unit]) -> list[dict]:
    return [{"no": u.no, "title": u.title} for u in units]


def to_jsonable_standards(standards: Iterable[Standard]) -> list[dict]:
    return [
        {
            "code": s.code,
            "text": s.text,
            "grade_hint": s.grade_hint,
            "unit_no": s.unit_no,
            "unit_title": s.unit_title,
        }
        for s in standards
    ]


def main() -> int:
    root = Path(".").resolve()
    hwpx_files = sorted(root.glob("*.hwpx"))
    if not hwpx_files:
        print("No .hwpx files found in repo root.")
        return 1

    raw_dir = root / "cbi_logs" / "curriculum_raw"
    index_dir = root / "cbi_logs" / "curriculum_index"
    raw_dir.mkdir(parents=True, exist_ok=True)
    index_dir.mkdir(parents=True, exist_ok=True)

    generated: list[dict] = []
    now = datetime.now(timezone.utc).isoformat()

    for hwpx in hwpx_files:
        text = extract_hwpx_text(hwpx)

        raw_path = raw_dir / f"{hwpx.stem}.txt"
        raw_path.write_text(text, encoding="utf-8")

        units = parse_units(text)
        standards = parse_standards(text, units)

        doc = {
            "source_file": hwpx.name,
            "subject_guess": guess_subject(hwpx.stem),
            "extracted_at_utc": now,
            "unit_count": len(units),
            "standard_count": len(standards),
            "units": to_jsonable_units(units),
            "standards": to_jsonable_standards(standards),
        }

        json_path = index_dir / f"{hwpx.stem}.json"
        json_path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")

        generated.append(
            {
                "source_file": hwpx.name,
                "subject_guess": doc["subject_guess"],
                "raw_text": str(raw_path.relative_to(root)).replace("\\", "/"),
                "index_json": str(json_path.relative_to(root)).replace("\\", "/"),
                "unit_count": doc["unit_count"],
                "standard_count": doc["standard_count"],
            }
        )

    manifest = {
        "generated_at_utc": now,
        "document_count": len(generated),
        "documents": generated,
    }
    (index_dir / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Processed {len(generated)} HWPX files.")
    for item in generated:
        print(
            f"- {item['source_file']}: units={item['unit_count']}, standards={item['standard_count']}"
        )
    print("Manifest: cbi_logs/curriculum_index/index.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
