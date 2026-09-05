import sounddevice as sd
from scipy.io.wavfile import write
from faster_whisper import WhisperModel
import os

print("Loading Whisper model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

def listen(seconds=5):

    print("\n🎤 Speak now...")

    sample_rate = 16000

    recording = sd.rec(
        int(seconds * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="int16"
    )

    sd.wait()

    os.makedirs("output", exist_ok=True)

    write(
        "output/input.wav",
        sample_rate,
        recording
    )

    segments, _ = model.transcribe(
        "output/input.wav"
    )

    text = ""

    for segment in segments:
        text += segment.text

    print("You said:", text)

    return text.strip()
