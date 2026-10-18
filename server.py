import json

from flask import Flask, request, jsonify
from flask_cors import CORS

from main import llm_response

app = Flask(__name__)
CORS(app)


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
