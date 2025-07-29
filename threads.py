import requests
from PyQt5.QtCore import QThread, pyqtSignal
import tempfile
import pygame
import os
import time
import random
import logging
import speech_recognition as sr
import numpy as np
import sounddevice as sd
import soundfile as sf
import queue
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import math

class VoiceChatThread(QThread):
    finished = pyqtSignal(str)
    update_status = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.recognizer = sr.Recognizer()
        self.audio_queue = queue.Queue()
        self.is_recording = False
        self.silence_threshold = 300

    def run(self):
        try:
            self.update_status.emit("Initializing voice recognition...")
            self.is_recording = True
            
            def audio_callback(indata, frames, time, status):
                if status:
                    logging.warning(f"Audio callback status: {status}")
                self.audio_queue.put(bytes(indata))

            with sd.InputStream(samplerate=16000, channels=1, callback=audio_callback):
                self.update_status.emit("Listening... Speak now.")
                audio_data = self.record_audio()
                
            if audio_data:
                self.update_status.emit("Processing speech...")
                text = self.recognize_speech(audio_data)
                self.finished.emit(text)
            else:
                self.update_status.emit("No speech detected.")
                self.finished.emit("")
        except Exception as e:
            logging.error(f"Error in VoiceChatThread: {e}")
            self.update_status.emit(f"Error: {str(e)}")
            self.finished.emit("")

    def record_audio(self):
        audio_data = []
        silence_counter = 0
        speech_detected = False

        while self.is_recording:
            try:
                data = self.audio_queue.get(timeout=0.5)
                audio_data.append(data)
                
                if np.abs(np.frombuffer(data, dtype=np.int16)).mean() > self.silence_threshold:
                    silence_counter = 0
                    speech_detected = True
                else:
                    silence_counter += 1

                if speech_detected and silence_counter > 32:
                    break

                if len(audio_data) > 320 and not speech_detected:
                    break

            except queue.Empty:
                pass

        return b''.join(audio_data) if speech_detected else None

    def recognize_speech(self, audio_data):
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
            sf.write(temp_audio_file.name, np.frombuffer(audio_data, dtype=np.int16), 16000)
            
            with sr.AudioFile(temp_audio_file.name) as source:
                audio = self.recognizer.record(source)
            
            try:
                text = self.recognizer.recognize_google(audio)
                return text
            except sr.UnknownValueError:
                return "Speech was unintelligible"
            except sr.RequestError as e:
                return f"Could not request results; {e}"

class SpeechThread(QThread):
    finished = pyqtSignal()
    update_status = pyqtSignal(str)

    def __init__(self, text, accent='EN-Default', speed=1.1):
        super().__init__()
        self.text = text
        self.accent = accent
        self.speed = speed

    def run(self):
        try:
            self.update_status.emit("Generating speech...")
            
            response = requests.post('http://localhost:8888/tts', json={
                'text': self.text,
                'speaker': self.accent,
                'speed': self.speed
            })
            
            if response.status_code == 200:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                    tf.write(response.content)
                    temp_filename = tf.name

                self.update_status.emit("Playing speech...")
                pygame.mixer.init()
                pygame.mixer.music.load(temp_filename)
                pygame.mixer.music.play()

                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)

                pygame.mixer.quit()
                os.unlink(temp_filename)
                self.update_status.emit("Speech playback completed.")
            else:
                self.update_status.emit(f"Error generating speech: {response.text}")

        except Exception as e:
            self.update_status.emit(f"Error in speech generation: {str(e)}")
        finally:
            self.finished.emit()

class ImageGenerationThread(QThread):
    finished = pyqtSignal(str)
    update_status = pyqtSignal(str)

    def __init__(self, prompt):
        super().__init__()
        self.prompt = prompt

    def run(self):
        try:
            self.update_status.emit("Generating image...")
            image = self.generate_procedural_image(self.prompt)
            image_data = self.image_to_base64(image)
            self.finished.emit(image_data)
            self.update_status.emit("Image generation completed.")
        except Exception as e:
            logging.error(f"Image Generation Error: {e}")
            self.update_status.emit(f"Error in image generation: {str(e)}")
            self.finished.emit("")

    def generate_procedural_image(self, prompt):
        width, height = 512, 512
        image = Image.new('RGB', (width, height), color='black')
        draw = ImageDraw.Draw(image)

        colors = self.extract_colors(prompt)
        shapes = self.extract_shapes(prompt)

        self.generate_background(draw, width, height, colors)

        for shape in shapes:
            self.generate_shape(draw, width, height, shape, colors)

        self.add_noise(image)
        self.add_text_overlay(draw, prompt)

        return image

    def extract_colors(self, prompt):
        color_keywords = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'white']
        return [color for color in color_keywords if color in prompt.lower()] or ['white']

    def extract_shapes(self, prompt):
        shape_keywords = ['circle', 'square', 'triangle', 'star', 'spiral', 'line']
        return [shape for shape in shape_keywords if shape in prompt.lower()] or ['circle']

    def generate_background(self, draw, width, height, colors):
        if len(colors) > 1:
            for y in range(height):
                r = int((1 - y / height) * 255)
                g = int((y / height) * 255)
                b = int(random.randint(0, 255))
                for x in range(width):
                    draw.point((x, y), fill=(r, g, b))
        else:
            draw.rectangle([0, 0, width, height], fill=colors[0])

    def generate_shape(self, draw, width, height, shape, colors):
        color = random.choice(colors)
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(20, 100)

        if shape == 'circle':
            draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
        elif shape == 'square':
            draw.rectangle([x-size, y-size, x+size, y+size], fill=color)
        elif shape == 'triangle':
            draw.polygon([(x, y-size), (x-size, y+size), (x+size, y+size)], fill=color)
        elif shape == 'star':
            self.draw_star(draw, x, y, size, color)
        elif shape == 'spiral':
            self.draw_spiral(draw, x, y, size, color)
        elif shape == 'line':
            angle = random.uniform(0, 2*math.pi)
            end_x = x + size * math.cos(angle)
            end_y = y + size * math.sin(angle)
            draw.line([x, y, end_x, end_y], fill=color, width=3)

    def draw_star(self, draw, x, y, size, color):
        points = []
        for i in range(10):
            angle = math.pi / 5 * i
            distance = size if i % 2 == 0 else size / 2
            point_x = x + distance * math.cos(angle)
            point_y = y + distance * math.sin(angle)
            points.append((point_x, point_y))
        draw.polygon(points, fill=color)

    def draw_spiral(self, draw, x, y, size, color):
        theta = 0
        while theta < 8 * math.pi:
            r = theta * size / (8 * math.pi)
            point_x = x + r * math.cos(theta)
            point_y = y + r * math.sin(theta)
            draw.point((point_x, point_y), fill=color)
            theta += 0.1

    def add_noise(self, image):
        pixels = image.load()
        for i in range(image.size[0]):
            for j in range(image.size[1]):
                r, g, b = pixels[i, j]
                noise = random.randint(-20, 20)
                pixels[i, j] = (
                    max(0, min(255, r + noise)),
                    max(0, min(255, g + noise)),
                    max(0, min(255, b + noise))
                )

    def add_text_overlay(self, draw, prompt):
        font = ImageFont.load_default()
        draw.text((10, 10), prompt, fill="white", font=font)

    def image_to_base64(self, image):
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()



# This completes the threads.py file with all necessary thread classes and utility functions.