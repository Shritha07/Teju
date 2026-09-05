from TTS.api import TTS

print("Loading XTTS model...")

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

print("Generating voice...")

tts.tts_to_file(
    text="Hello Akka. I am Teju. I have been waiting to meet you.",
    speaker_wav="voices/akka_reference.aac",
    language="en",
    file_path="output/teju_first.wav",
)

print("Done!")
print("Saved to output/teju_first.wav")