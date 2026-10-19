import json
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from main import llm_response

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"

app = Flask(__name__, static_folder=None)
CORS(app)


@app.get("/")
@app.get("/<path:path>")
def frontend(path="index.html"):
    if not FRONTEND_DIST.exists():
        return "Frontend not built. Run `npm run build` in frontend/.", 404
    if not (FRONTEND_DIST / path).is_file():
        path = "index.html"
    return send_from_directory(FRONTEND_DIST, path)


@app.post("/api/chat")
def chat():
    message = request.form.get("message", "").strip()
    image_file = request.files.get("image")

    if not message and not image_file:
        return jsonify({"error": "Provide a message or an image."}), 400

    image_bytes = image_file.read() if image_file else None

    try:
        history = json.loads(request.form.get("history", "[]"))
    except json.JSONDecodeError:
        history = []

    try:
        reply = llm_response(
            message or "Identify all appliances and estimate energy usage based on the following image.",
            image_bytes=image_bytes,
            history=history if isinstance(history, list) else [],
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"response": reply})


if __name__ == "__main__":
    app.run(port=5000, debug=True)
