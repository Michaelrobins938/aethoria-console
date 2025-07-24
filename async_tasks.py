# fmt: off
import os
import asyncio
from collections import deque
from colorama import init, Fore, Style
from dotenv import load_dotenv
from datetime import datetime
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
os.environ['KMP_DUPLICATE_LIB_OK'] = "TRUE"  # Set the environment variable to handle OpenMP conflict
import pygame
import logging
import numpy as np
from TTS.api import TTS
import simpleaudio as sa
# fmt: on

load_dotenv()
init(autoreset=True)

# Set up logging
logging.basicConfig(level=logging.INFO, filename='aethoria_ai.log', filemode='a',
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

file_increment = 0
audio_queue = deque()

# Define the text_to_speech_queue as a global asyncio Queue that can be accessed by the main script
text_to_speech_queue = asyncio.Queue()

shutdown_event = asyncio.Event()

directory = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
os.makedirs(f'output/{directory}', exist_ok=True)

# Initialize TTS
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", 
          progress_bar=False, 
          gpu=False,
          vocoder_path=r"C:\Program Files\eSpeak NG\espeak-ng.exe")

pygame.mixer.init()

async def process_text_to_speech(text):
    global file_increment
    filename = f'output/{directory}/{file_increment}.wav'
    file_increment += 1

    try:
        logging.info(f"Processing TTS for text: {text}")
        wav = tts.tts(text)
        logging.info(f"Audio generated. Shape: {wav.shape}, Type: {wav.dtype}")

        # Convert to int16 format for simpleaudio
        audio_int16 = (np.array(wav) * 32767).astype(np.int16)
        logging.info(f"Audio converted to int16. Shape: {audio_int16.shape}, Type: {audio_int16.dtype}")

        with open(filename, 'wb') as audio_file:
            audio_file.write(audio_int16.tobytes())

        audio_queue.append(filename)
        logging.info(f"Audio file saved: {filename}")
    except Exception as e:
        logging.error(f"Exception in process_text_to_speech: {e}", exc_info=True)
        print(Fore.RED + f"Exception in process_text_to_speech: {e}")

async def play_audio():
    while True:
        if audio_queue:
            filename = audio_queue.popleft()
            try:
                wave_obj = sa.WaveObject.from_wave_file(filename)
                play_obj = wave_obj.play()
                play_obj.wait_done()
                logging.info(f"Audio played: {filename}")
            except Exception as e:
                logging.error(f"Error playing audio {filename}: {e}", exc_info=True)
                print(Fore.RED + f"Error playing audio {filename}: {e}")
        await asyncio.sleep(0.1)

async def text_to_speech_consumer(text_to_speech_queue):
    while True:
        text = await text_to_speech_queue.get()
        await process_text_to_speech(text)
        text_to_speech_queue.task_done()

async def start_async_tasks(text_to_speech_queue):
    """Starts asynchronous tasks without directly calling loop.run_forever()."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:  # No running event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    consumer_task = loop.create_task(text_to_speech_consumer(text_to_speech_queue))
    play_task = loop.create_task(play_audio())
    return consumer_task, play_task

async def stop_async_tasks():
    # Cancel all running tasks
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    [task.cancel() for task in tasks]

    # Gather all tasks to let them finish with cancellation
    await asyncio.gather(*tasks, return_exceptions=True)

if __name__ == "__main__":
    try:
        asyncio.run(start_async_tasks(text_to_speech_queue))
    except Exception as e:
        logging.error(f"Error running async tasks: {e}", exc_info=True)
        print(Fore.RED + f"Error running async tasks: {e}")