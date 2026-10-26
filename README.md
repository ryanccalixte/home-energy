# Home Energy

Home Energy is an AI assistant that estimates how much electricity your home uses and suggests ways to save. Describe your appliances in the chat or upload a photo of a room. The app finds the energy-using appliances, estimates their daily usage and cost, and gives practical tips like switching to LEDs, cutting standby power, or adding solar.

All AI processing runs locally. The vision model runs in the browser, and the language model runs through [Ollama](https://ollama.com/), so no data is sent to a cloud API.

## Features

- **Chat assistant:** ask about your home's energy use in plain language and get back tables of appliances, estimated wattage and cost, plus suggestions.
- **Room scanner:** upload a photo, and TensorFlow.js (COCO-SSD) detects appliances such as TVs, laptops, microwaves, ovens and refrigerators right in the browser.
- **Editable estimates:** adjust how many hours a day each appliance runs and the electricity rate (default $0.17/kWh, the rough U.S. average).
- **Image-aware follow-up:** scan results and the photo are sent to a multimodal model, which double-checks the estimate and points out appliances the scanner missed.
- **Conversation history:** follow-up questions keep the context of the conversation.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, react-markdown, TensorFlow.js + COCO-SSD |
| Backend | Python, Flask, Flask-CORS |
| AI model | Ollama running Gemma |

## Project Structure

```
home-energy/
├── main.py            # System prompt and the llm_response() call to Ollama
├── server.py          # Flask API (POST /api/chat)
├── Modelfile          # Ollama Modelfile with the assistant's system prompt
├── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx                 # Hash-based routing (/, /chat, /credits)
        ├── components/
        │   ├── NavBar.jsx
        │   └── RoomScanner.jsx     # In-browser object detection and usage estimate
        ├── data/appliances.js      # Wattage and typical hours for detectable appliances
        └── pages/
            ├── Home.jsx
            ├── Chat.jsx
            └── Credits.jsx
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- [Ollama](https://ollama.com/download)

### 1. Pull the model

```bash
ollama pull gemma4
```

`main.py` uses the `gemma4` model. To use a different one, change the `model=` value in `llm_response()`.

### 2. Start the backend

```bash
cd home-energy
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python server.py
```

The API runs at `http://localhost:5000`.

### 3. Start the frontend

In a second terminal:

```bash
cd home-energy/frontend
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## API

### `POST /api/chat`

Takes `multipart/form-data`:

| Field | Type | Description |
| --- | --- | --- |
| `message` | string | The user's question. Optional if an image is sent. |
| `image` | file | Photo of a room. Optional. |
| `history` | JSON string | Earlier turns as `[{"role": "user" \| "assistant", "content": "..."}]`. Optional. |

Response:

```json
{ "response": "markdown text from the assistant" }
```

If neither a message nor an image is sent, it returns `400`. If the model call fails, it returns `500` with `{ "error": "..." }`.

## Disclaimer

All numbers are rough estimates based on typical wattages, not exact measurements. Use them as a guide, not as a replacement for your utility bill or a professional energy audit.

## Contributors

- **Ryan Calixte:** computer vision and machine learning, AI prompt design ([GitHub](https://github.com/ryanccalixte))
- **Adrian Garcia:** computer vision model testing and data analysis

## License

[MIT](LICENSE)
