
import json
import os
import urllib.request
import urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

BASE_DIR = Path(__file__).resolve().parent

def load_env():
    env_file = BASE_DIR / ".env"

    if not env_file.exists():
        return

    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)

        os.environ.setdefault(
            key.strip(),
            value.strip().strip('"').strip("'")
        )


load_env()

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """
You are ROSCOE, a professional and intelligent female AI
personal life and career companion.

The user likes to be addressed as Boss. Use this naturally.

PERSONALITY:
- Friendly, confident, warm and professional.
- Speak like a helpful human assistant.
- Do not repeat the same answers.
- Understand conversation history and follow-up questions.
- Never restrict yourself to preset topics or buttons.

GENERAL QUESTION ANSWERING:
- Answer questions about AI, ML, Python, Java, science,
  mathematics, technology, education, career and daily life.
- Explain technical topics in beginner-friendly language.
- Use examples when helpful.
- For current facts, use available Google Search grounding.
- Never invent sources, dates, facts or results.
- Be honest if information is uncertain.

LANGUAGE:
- Understand Hindi, English and Hinglish.
- Respond in the language used by the user.
- If the user mixes Hindi and English, respond naturally
  in the same style.

INTERVIEW MODE:
If the user asks for an interview:
1. Identify the exact skill.
2. Identify the difficulty and interview type if supplied.
3. Begin the interview immediately.
4. Ask ONE question at a time.
5. Wait for the user's answer.
6. Evaluate the answer honestly.
7. Explain what was correct and incorrect.
8. Give an improved answer when necessary.
9. Ask the next question based on the previous response.
10. At the end, give an honest score and improvement plan.

Examples:
"Interview me on Python" means a Python interview.
"Take my Machine Learning interview" means an ML interview.
"Ask advanced Java questions" means advanced Java questions.

PERSONALIZATION:
Use the profile provided with the request when relevant.
Do not invent the user's skills, education or experience.

OUTPUT:
- Use clear, useful answers.
- Use headings and examples when needed.
- Avoid unnecessary repetition.
- Never claim to have completed a task that you did not perform.
"""


class ROSCOEHandler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(
            *args,
            directory=str(BASE_DIR),
            **kwargs
        )

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            self.send_json(200, {
                "status": "online",
                "ai_configured": bool(API_KEY),
                "model": MODEL
            })
            return

        if self.path == "/":
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self):
        if self.path != "/api/chat":
            self.send_json(404, {"error": "Endpoint not found"})
            return

        if not API_KEY:
            self.send_json(503, {
                "error": "GEMINI_API_KEY is missing. Configure your .env file."
            })
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))

            if length <= 0 or length > 100000:
                self.send_json(400, {
                    "error": "Invalid request size."
                })
                return

            payload = json.loads(
                self.rfile.read(length).decode("utf-8")
            )

            message = str(payload.get("message", "")).strip()

            if not message:
                self.send_json(400, {
                    "error": "Message cannot be empty."
                })
                return

            profile = payload.get("profile", {})
            history = payload.get("history", [])

            profile_context = json.dumps(
                profile,
                ensure_ascii=False
            )

            contents = []

            for item in history[-12:]:
                role = item.get("role")
                text = str(item.get("text", "")).strip()

                if not text:
                    continue

                if role not in ("user", "assistant", "model"):
                    continue

                contents.append({
                    "role": "model" if role == "assistant" else role,
                    "parts": [{"text": text[:12000]}]
                })

            final_message = (
                "User profile context:\n"
                + profile_context
                + "\n\nUser's latest message:\n"
                + message
            )

            contents.append({
                "role": "user",
                "parts": [{"text": final_message}]
            })

            request_body = {
                "systemInstruction": {
                    "parts": [{"text": SYSTEM_PROMPT}]
                },
                "contents": contents,
                "tools": [
                    {"google_search": {}}
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                }
            }

            endpoint = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + MODEL
                + ":generateContent?key="
                + API_KEY
            )

            request = urllib.request.Request(
                endpoint,
                data=json.dumps(request_body).encode("utf-8"),
                headers={
                    "Content-Type": "application/json"
                },
                method="POST"
            )

            with urllib.request.urlopen(
                request,
                timeout=90
            ) as response:
                result = json.loads(
                    response.read().decode("utf-8")
                )

            candidates = result.get("candidates", [])

            if not candidates:
                self.send_json(502, {
                    "error": "The AI model did not return an answer."
                })
                return

            parts = candidates[0].get("content", {}).get("parts", [])

            reply = "\n".join(
                part["text"]
                for part in parts
                if "text" in part
            ).strip()

            if not reply:
                self.send_json(502, {
                    "error": "Empty response from AI model."
                })
                return

            self.send_json(200, {
                "reply": reply,
                "model": MODEL
            })

        except urllib.error.HTTPError as error:
            details = error.read().decode("utf-8", errors="replace")

            print("Gemini HTTP error:", error.code, details)

            self.send_json(502, {
                "error": "Gemini API error. Check API key, model and API quota."
            })

        except urllib.error.URLError as error:
            print("Network error:", error)

            self.send_json(503, {
                "error": "Could not connect to Gemini. Check your internet connection."
            })

        except Exception as error:
            print("ROSCOE server error:", error)

            self.send_json(500, {
                "error": "Internal ROSCOE server error."
            })


if __name__ == "__main__":
    server = ThreadingHTTPServer(
        ("127.0.0.1", 8000),
        ROSCOEHandler
    )

    print("=" * 50)
    print("ROSCOE AI SERVER")
    print("Website: http://127.0.0.1:8000")
    print("Health:  http://127.0.0.1:8000/api/health")
    print("AI configured:", bool(API_KEY))
    print("Model:", MODEL)
    print("=" * 50)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nROSCOE server stopped.")
    finally:
        server.server_close()
