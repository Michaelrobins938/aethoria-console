import sounddevice as sd
import soundfile as sf

def record_audio():
    fs = 16000
    seconds = 5
    print("Recording...")
    recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    print("Recording finished.")
    filename = "recording.wav"
    sf.write(filename, recording, fs)
    return filename

def transcribe_audio_to_text(audio, fs):
    transcription = whisper_model.transcribe(audio, language="en", beam_size=5, best_of=5)
    return transcription["text"]