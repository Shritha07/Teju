from TTS.api import TTS
import os

print("Loading XTTS model...")

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

def speak(text):
    print("Teju is speaking...")

    tts.tts_to_file(
        text=text,
        speaker_wav="voices/akka_reference.wav",
        language="en",
        file_path="output/teju_reply.wav",
    )

    os.system("afplay output/teju_reply.wav")

    print("Done!")