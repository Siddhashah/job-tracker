import re
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

SKILLS_TAXONOMY = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "perl", "dart",
    "elixir", "haskell", "matlab", "objective-c", "sql", "bash", "shell",
    "powershell", "lua", "groovy", "r",

    # Frontend
    "react", "vue", "angular", "svelte", "next.js", "nuxt", "jquery",
    "html", "css", "sass", "less", "tailwind", "tailwind css", "bootstrap",
    "webpack", "vite", "redux", "mobx", "ember.js",

    # Backend / frameworks
    "node.js", "express", "django", "flask", "fastapi", "spring",
    "spring boot", "rails", "ruby on rails", "laravel", "asp.net", ".net",
    "nestjs", "graphql", "rest api", "grpc", "microservices",

    # Databases
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle",
    "cassandra", "dynamodb", "elasticsearch", "firebase", "mariadb",
    "neo4j", "couchdb", "supabase",

    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "ci/cd", "github actions", "gitlab ci", "circleci", "helm",
    "nginx", "linux", "serverless", "cloudformation",

    # Testing
    "jest", "mocha", "cypress", "selenium", "pytest", "junit",
    "testing library", "tdd", "unit testing", "integration testing",

    # Mobile
    "react native", "flutter", "ios", "android", "xamarin", "swiftui",

    # Data / ML
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "keras", "nlp", "computer vision",
    "data analysis", "data engineering", "spark", "hadoop", "airflow",
    "tableau", "power bi", "etl",

    # Tools
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "postman",

    # Methodology / process
    "agile", "scrum", "kanban", "waterfall", "devops",

    # Commonly-listed soft skills / requirements
    "communication", "leadership", "problem solving", "teamwork",
    "project management", "mentoring", "cross-functional collaboration",
    "stakeholder management", "time management",
]

# Precompiled once at import time — each pattern checks that the skill
# isn't glued to surrounding letters/numbers, so "go" won't match inside
# "django" and "java" won't match inside "javascript".
_SKILL_PATTERNS = [
    (skill, re.compile(r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])", re.IGNORECASE))
    for skill in SKILLS_TAXONOMY
]


def skills_extract(text: str) -> list:
    return [skill for skill, pattern in _SKILL_PATTERNS if pattern.search(text)]


EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship", "freelance", "temporary"]


def regex_extract(text: str) -> dict:
    result = {"salary": None, "employmentType": None}

    salary_pattern = r"\$\s?\d{2,3}(?:,\d{3}|k)?\s*(?:-|to|–)\s*\$?\s?\d{2,3}(?:,\d{3}|k)?(?:\s*/\s*(?:hr|hour|yr|year))?"
    salary_match = re.search(salary_pattern, text, re.IGNORECASE)
    if salary_match:
        result["salary"] = salary_match.group().strip()

    lowered = text.lower()
    for emp_type in EMPLOYMENT_TYPES:
        if emp_type in lowered:
            result["employmentType"] = emp_type.title()
            break

    return result


def labeled_field(text: str, labels: list[str]) -> str | None:
    """Look for an explicit 'Label: value' line — far more reliable than NER
    when the posting spells the field out directly."""
    pattern = r"(?:" + "|".join(labels) + r")\s*[:\-]\s*(.+)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        value = match.group(1).strip().split("\n")[0].strip()
        return value or None
    return None


def ner_extract(text: str) -> dict:
    # Flatten line breaks into sentence breaks before running NER. Without
    # this, the small model sometimes glues the end of one line onto the
    # start of the next ("Nimbus AnalyticsLocation") when there's no
    # punctuation between them.
    cleaned = re.sub(r"\n+", ". ", text)
    doc = nlp(cleaned[:5000])

    orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    locations = [ent.text for ent in doc.ents if ent.label_ in ("GPE", "LOC")]

    company = Counter(orgs).most_common(1)[0][0] if orgs else None
    location = Counter(locations).most_common(1)[0][0] if locations else None

    return {"company": company, "location": location}


def title_extract(text: str) -> str | None:
    labeled = labeled_field(text, ["job title", "position", "title", "role"])
    if labeled:
        return labeled[:100]

    # Common unlabeled phrasings, tried before falling back to "first line" —
    # these catch postings written as flowing sentences instead of a
    # labeled header block.
    patterns = [
        r"^([A-Z][\w\s/&\-]{2,60}?)\s+needed at\b",
        r"^([A-Z][\w\s/&\-]{2,60}?)\s+wanted at\b",
        r"(?:hiring|seeking|looking for)\s+(?:a|an)\s+([A-Z][\w\s/&\-]{2,60}?)(?:\s+to\b|\s+who\b|,|\.)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()[:100]

    first_line = text.strip().split("\n")[0].strip()
    if 3 < len(first_line) < 80:
        return first_line

    # Last resort: first sentence instead of first line, for postings that
    # are one continuous paragraph with no line breaks at all.
    first_sentence = re.split(r"(?<=[.!?])\s", text.strip())[0].strip()
    if 3 < len(first_sentence) < 80:
        return first_sentence

    return None


def merge_results(text: str) -> dict:
    regex_fields = regex_extract(text)
    ner_fields = ner_extract(text)
    skills = skills_extract(text)
    job_title = title_extract(text)

    # Prefer an explicit label over an NER guess — a posting that spells
    # out "Company: X" should never lose to a model misclassification.
    company = labeled_field(text, ["company"]) or ner_fields["company"]
    location = labeled_field(text, ["location"]) or ner_fields["location"]

    return {
        "company": company,
        "jobTitle": job_title,
        "location": location,
        "salary": regex_fields["salary"],
        "employmentType": regex_fields["employmentType"],
        "skills": skills,
    }