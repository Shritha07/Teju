from memory_manager import *
from ai.gemini import ask_gemini
from voice.tts import speak
from voice.stt import listen

# Load personality
with open("personality/teju.txt", "r", encoding="utf-8") as f:
    personality = f.read()

memory = load_last_chat()

print("\n==============================")
print(" Teju is ready ❤️")
print("==============================\n")

while True:
    print("\nPress Enter to talk...")
    input()

    user = listen()

    if not user:
        continue

    if user.lower() in ["exit", "quit"]:
        print("Goodbye ❤️")
        break

    prompt = f"""
{personality}

Last Conversation

Shritha:
{memory["user"]}

Teju:
{memory["teju"]}

Current Conversation

Shritha:
{user}

Reply naturally as Teju.
"""

    reply = ask_gemini(prompt)

    save_last_chat(user, reply)

    memory["user"] = user
    memory["teju"] = reply

    print("\nTeju:", reply)
    print()

    speak(reply)