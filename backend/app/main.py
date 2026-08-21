from fastapi import FastAPI

app = FastAPI(
    title="CommerceOS API"
)

@app.get("/")
def root():
    return {
        "message": "CommerceOS Running"
    }