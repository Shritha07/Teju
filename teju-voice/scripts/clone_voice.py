from TTS.api import TTS

print("Loading XTTS model...")

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

while True:
    text = input("\nWhat should Teju say? (type 'exit' to quit): ")

    if text.lower() == "exit":
        break

    tts.tts_to_file(
        text=text,
        speaker_wav="voices/akka_reference.wav",
        language="en",
        file_path="output/teju_first.wav",
    )

    print("Generated!")
    print("Saved to output/teju_first.wav")