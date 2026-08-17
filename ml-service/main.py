from fastapi import FastAPI
from pydantic import BaseModel
from extractors import merge_results

app = FastAPI()


class ExtractRequest(BaseModel):
    text: str


@app.post("/extract")
def extract(req: ExtractRequest):
    return merge_results(req.text)


@app.get("/health")
def health():
    return {"status": "ok"}