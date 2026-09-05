import json

FILE = "memory/last_chat.json"

def load_last_chat():
    try:
        with open(FILE, "r") as f:
            return json.load(f)
    except:
        return {"user": "", "teju": ""}

def save_last_chat(user, teju):
    with open(FILE, "w") as f:
        json.dump(
            {
                "user": user,
                "teju": teju
            },
            f,
            indent=4
        )
