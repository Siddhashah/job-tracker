import re
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

SKILLS_TAXONOMY = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "perl", "dart",
    "elixir", "haskell", "matlab", "objective-c", "sql", "bash", "shell",
    "powershell", "lua", "groovy", "r",
    "react", "vue", "angular", "svelte", "next.js", "nuxt", "jquery",
    "html", "css", "sass", "less", "tailwind", "tailwind css", "bootstrap",
    "webpack", "vite", "redux", "mobx", "ember.js",
    "node.js", "express", "django", "flask", "fastapi", "spring",
    "spring boot", "rails", "ruby on rails", "laravel", "asp.net", ".net",
    "nestjs", "graphql", "rest api", "grpc", "microservices",
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle",
    "cassandra", "dynamodb", "elasticsearch", "firebase", "mariadb",
    "neo4j", "couchdb", "supabase",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "ci/cd", "github actions", "gitlab ci", "circleci", "helm",
    "nginx", "linux", "serverless", "cloudformation",
    "jest", "mocha", "cypress", "selenium", "pytest", "junit",
    "testing library", "tdd", "unit testing", "integration testing",
    "react native", "flutter", "ios", "android", "xamarin", "swiftui",
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "keras", "nlp", "computer vision",
    "data analysis", "data engineering", "spark", "hadoop", "airflow",
    "tableau", "power bi", "etl",
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "postman",
    "agile", "scrum", "kanban", "waterfall", "devops",
    "communication", "leadership", "problem solving", "teamwork",
    "project management", "mentoring", "cross-functional collaboration",
    "stakeholder management", "time management",
]

EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship", "freelance", "temporary"]

_SKILL_PATTERNS = [
    (skill, re.compile(r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])", re.IGNORECASE))
    for skill in SKILLS_TAXONOMY
]


def regex_extract(text: str) -> dict:
    result = {"salary": None, "employmentType": None}

    # Range first ("$90,000 - $120,000", "$70 - $85/hr") — more informative
    # than a single number when both are present in the text.
    range_pattern = r"\$\s?\d{2,3}(?:,\d{3}|k)?\s*(?:-|to|–)\s*\$?\s?\d{2,3}(?:,\d{3}|k)?(?:\s*/\s*(?:hr|hour|yr|year))?"
    match = re.search(range_pattern, text, re.IGNORECASE)
    if match:
        result["salary"] = match.group().strip()
    else:
        # Fall back to a single value ("$60/hr", "base $50,000") — postings
        # that quote one number instead of a range were previously missed
        # entirely, since the range pattern requires two numbers.
        single_pattern = r"\$\s?\d{2,3}(?:,\d{3}|k)?(?:\s*/\s*(?:hr|hour|yr|year))?"
        match = re.search(single_pattern, text, re.IGNORECASE)
        if match:
            result["salary"] = match.group().strip()

    lowered = text.lower()
    for emp_type in EMPLOYMENT_TYPES:
        if emp_type in lowered:
            result["employmentType"] = emp_type.title()
            break

    return result


def labeled_field(text: str, labels: list) -> str | None:
    pattern = r"(?:" + "|".join(labels) + r")\s*[:\-]\s*(.+)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        value = match.group(1).strip().split("\n")[0].strip()
        return value or None
    return None


_NAME_TOKEN = r"(?:[A-Z][\w'\-]*|&)"
_COMPANY_TRIGGER_PATTERNS = [
    r"\b[Aa]t[ \t]+(" + _NAME_TOKEN + r"(?:[ \t]+" + _NAME_TOKEN + r"){0,4})",
    r"\b[Jj]oin[ \t]+(" + _NAME_TOKEN + r"(?:[ \t]+" + _NAME_TOKEN + r"){0,4})",
    r"^(" + _NAME_TOKEN + r"(?:[ \t]+" + _NAME_TOKEN + r"){0,4})[ \t]+is[ \t]+(?:a|an|looking for|hiring|seeking)\b",
]


def pattern_company_extract(text: str) -> str | None:
    for pattern in _COMPANY_TRIGGER_PATTERNS:
        flags = re.MULTILINE if pattern.startswith("^") else 0
        match = re.search(pattern, text, flags)
        if match:
            candidate = match.group(1).strip()
            if len(candidate) > 1:
                return candidate
    return None


def ner_extract(text: str) -> dict:
    cleaned = re.sub(r"\n+", ". ", text)
    doc = nlp(cleaned[:5000])
    orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    locations = [ent.text for ent in doc.ents if ent.label_ in ("GPE", "LOC")]
    company = Counter(orgs).most_common(1)[0][0] if orgs else None
    location = Counter(locations).most_common(1)[0][0] if locations else None
    return {"company": company, "location": location}


def extend_location(location: str, text: str) -> str:
    """NER frequently detects only the city ('Denver') and misses a
    directly-following state/region ('Denver, Colorado'), since that's a
    separate GPE span it doesn't always link back to the first. This
    checks the original text for a comma-separated region immediately
    after the detected location and appends it if present."""
    if not location:
        return location
    match = re.search(re.escape(location) + r",\s*([A-Z][A-Za-z]{1,20})\b", text)
    if match:
        return f"{location}, {match.group(1)}"
    return location


def skills_extract(text: str) -> list:
    return [skill for skill, pattern in _SKILL_PATTERNS if pattern.search(text)]


def _clean_title(title: str) -> str:
    title = title.strip()
    title = re.sub(r"\s*\([^)]*\)\s*$", "", title)  # strip trailing "(Contract)" etc.
    if " — " in title:  # "Role — Company" style headers
        title = title.split(" — ")[0].strip()
    elif re.search(r"\s-\s", title) and len(title) < 60:
        title = re.split(r"\s-\s", title)[0].strip()
    if "," in title and len(title) < 60 and title.count(",") == 1 and "." not in title:
        title = title.split(",")[0].strip()
    return title.strip()


_EARLY_TRIGGER_PATTERN = r"(?i:hiring|seeking|looking for)\s+(?:a|an)\s+(?:[a-z]+\s+){0,3}([A-Z][\w\s/&\-]{2,60}?)(?:\s+to\b|\s+who\b|,|\.)"


def title_extract(text: str) -> str | None:
    labeled = labeled_field(text, ["job title", "position", "title", "role"])
    if labeled:
        return _clean_title(labeled[:100])

    # Anchored, high-precision patterns tried first — in rough order of
    # how specific/reliable each phrasing is.
    anchored_patterns = [
        r"^(?i:hiring)\s*:\s*([A-Z][\w\s/&\-]{2,60}?)(?:\s+at\b|\.|$)",
        r"^([A-Z][\w\s/&\-]{2,60}?)\s+(?i:needed)(?:\s+at\b|\s+for\b)",
        r"^([A-Z][\w\s/&\-]{2,60}?)\s+(?i:wanted)\s+at\b",
        r"^([A-Z][\w\s/&\-]{2,60}?)\s+at\s+[A-Z]",
    ]
    for pattern in anchored_patterns:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            return _clean_title(match.group(1)[:100])

    # Trigger phrase ("looking for a X"), but only trusted if it appears
    # very early — a match deep in the body is more likely a second,
    # unrelated mention of the role than the real opening title.
    early_match = re.search(_EARLY_TRIGGER_PATTERN, text)
    if early_match and early_match.start() < 60:
        return _clean_title(early_match.group(1)[:100])

    first_line = text.strip().split("\n")[0].strip()
    if 3 < len(first_line) < 80:
        return _clean_title(first_line)

    first_sentence = re.split(r"(?<=[.!?])\s", text.strip())[0].strip()
    if 3 < len(first_sentence) < 80:
        return _clean_title(first_sentence)

    # Last resort: same trigger pattern, no position limit this time —
    # better than nothing if every positional method above found nothing.
    if early_match:
        return _clean_title(early_match.group(1)[:100])

    return None


_SKILL_NAMES_LOWER = {s.lower() for s in SKILLS_TAXONOMY}


def detect_remote(text: str) -> str | None:
    """No NER model tags 'Remote' as a place, since it isn't one — this is
    a deliberate special case for postings that state it plainly without a
    formal Location: field."""
    if re.search(r"\bremote\b", text[:200], re.IGNORECASE):
        return "Remote"
    return None


def merge_results(text: str) -> dict:
    regex_fields = regex_extract(text)
    ner_fields = ner_extract(text)
    skills = skills_extract(text)
    job_title = title_extract(text)

    company = labeled_field(text, ["company"]) or pattern_company_extract(text)
    if not company:
        company = ner_fields["company"]
        if company and job_title and (company.lower() in job_title.lower() or job_title.lower() in company.lower()):
            company = None

    ner_location = ner_fields["location"]
    if ner_location and ner_location.lower() in _SKILL_NAMES_LOWER:
        # e.g. spaCy occasionally tags "Flask" (the framework) as a place —
        # if the "location" is literally also a skill in our taxonomy,
        # that's almost certainly this exact misclassification, not a
        # real place that happens to share a name with a tool.
        ner_location = None

    location = labeled_field(text, ["location"]) or ner_location or detect_remote(text)
    location = extend_location(location, text)

    return {
        "company": company,
        "jobTitle": job_title,
        "location": location,
        "salary": regex_fields["salary"],
        "employmentType": regex_fields["employmentType"],
        "skills": skills,
    }