import os
import sys
import asyncio
import keyboard
import time
import tempfile
import datetime
import sounddevice as sd
import numpy as np
import json
import random
import logging
import cv2
import traceback
from threading import Thread
from scipy.io.wavfile import write as write_wav
from faster_whisper import WhisperModel
from dotenv import load_dotenv
from colorama import init, Fore, Style
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Force the model to use the CPU
import pygame
import torch
import torch.nn as nn
from gtts import gTTS
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtOpenGL import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import soundfile as sf
from groq import Groq
import tiktoken
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer, TextDataset, DataCollatorForLanguageModeling
from transformers import Trainer, TrainingArguments
import spacy
import pybullet as p
import pybullet_data
from scipy.spatial import cKDTree
from PIL import Image
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
from datetime import datetime
from collections import defaultdict
from pydub import AudioSegment
import simpleaudio as sa
import io

def retry_with_exponential_backoff(
    func,
    max_retries=5,
    initial_wait=1,
    exponential_base=2,
    jitter=True
):
    def wrapper(*args, **kwargs):
        retries = 0
        wait = initial_wait

        while retries < max_retries:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logging.error(f"Retry {retries} failed with error: {e}")
                if "rate_limit_exceeded" not in str(e):
                    raise e

                retries += 1
                if retries == max_retries:
                    raise e

                wait *= exponential_base * (1 + jitter * random.random())
                time.sleep(wait)

    return wrapper

# Initialize spaCy
nlp = spacy.load("en_core_web_sm")

# Global exception handler
def global_exception_handler(exctype, value, tb):
    logging.error("Uncaught exception", exc_info=(exctype, value, tb))
    print("An unexpected error occurred. Please check the log file for details.")

sys.excepthook = global_exception_handler

# Initialize logging
logging.basicConfig(filename='universal_game_system.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(message)s')

# Initialize colorama and load environment variables
init(autoreset=True)
load_dotenv()

# Ensure Torch uses CPU
device = torch.device("cpu")
torch.set_default_tensor_type(torch.FloatTensor)
torch.set_default_device(device)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_name = "llama-3.1-70b-versatile"

# Initialize Faster Whisper
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

# Initialize summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Global variables
conversation_history = []
shutdown_event = asyncio.Event()
recording_finished = False
is_recording = False
current_state = None
transcript_file = None
character_data = {}
session_data = {}
intro_video_path = r"C:\Users\Micha\Desktop\AethoriaWindows\gametitleintro\202407191827 (2).mp4"
game_prompt = ""

# Game states
class States:
    WAITING_FOR_USER = 1
    RECORDING_USER_INPUT = 2
    PROCESSING_USER_INPUT = 3
    GENERATING_RESPONSE = 4
    PLAYING_RESPONSE = 5

current_state = States.WAITING_FOR_USER

class NeoCyberpunkTheme:
    @staticmethod
    def apply_theme(app):
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(15, 15, 20))
        palette.setColor(QPalette.WindowText, QColor(0, 255, 255))
        palette.setColor(QPalette.Base, QColor(25, 25, 35))
        palette.setColor(QPalette.AlternateBase, QColor(35, 35, 45))
        palette.setColor(QPalette.ToolTipBase, QColor(0, 255, 255))
        palette.setColor(QPalette.ToolTipText, QColor(0, 255, 255))
        palette.setColor(QPalette.Text, QColor(0, 255, 255))
        palette.setColor(QPalette.Button, QColor(35, 35, 45))
        palette.setColor(QPalette.ButtonText, QColor(0, 255, 255))
        palette.setColor(QPalette.BrightText, QColor(255, 0, 128))
        palette.setColor(QPalette.Link, QColor(0, 255, 255))
        palette.setColor(QPalette.Highlight, QColor(0, 128, 255))
        palette.setColor(QPalette.HighlightedText, QColor(15, 15, 20))
        app.setPalette(palette)

        app.setStyleSheet("""
            QMainWindow, QWidget {
                background-color: #0F0F14;
                color: #00FFFF;
                font-family: 'Rajdhani', sans-serif;
            }
            QTextEdit, QListWidget {
                background-color: #191923;
                color: #00FFFF;
                border: 1px solid #00FFFF;
                border-radius: 5px;
                padding: 10px;
                font-size: 16px;
            }
            QPushButton {
                background-color: #232329;
                color: #00FFFF;
                border: 1px solid #00FFFF;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #2A2A33;
            }
            QLabel {
                color: #00FFFF;
                font-size: 16px;
            }
            QMenuBar {
                background-color: #191923;
                color: #00FFFF;
            }
            QMenuBar::item:selected {
                background-color: #2A2A33;
            }
            QMenu {
                background-color: #191923;
                color: #00FFFF;
            }
            QMenu::item:selected {
                background-color: #2A2A33;
            }
            QScrollBar:vertical {
                border: none;
                background: #191923;
                width: 14px;
                margin: 15px 0 15px 0;
            }
            QScrollBar::handle:vertical {
                background: #00FFFF;
                min-height: 30px;
                border-radius: 7px;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                border: none;
                background: none;
            }
        """)

class AnimatedButton(QPushButton):
    def __init__(self, text, parent=None):
        super().__init__(text, parent)
        self.setStyleSheet("""
            AnimatedButton {
                background-color: #232329;
                color: #00FFFF;
                border: 2px solid #00FFFF;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 14px;
            }
            AnimatedButton:hover {
                background-color: #2A2A33;
            }
        """)
        self.animation = QPropertyAnimation(self, b"geometry")
        self.animation.setDuration(100)
        self.animation.setEasingCurve(QEasingCurve.OutQuad)

    def enterEvent(self, event):
        self.animate(1.1)
        super().enterEvent(event)

    def leaveEvent(self, event):
        self.animate(1.0)
        super().leaveEvent(event)

    def animate(self, scale):
        rect = self.geometry()
        center = rect.center()
        new_width = int(rect.width() * scale)
        new_height = int(rect.height() * scale)
        new_rect = QRect(0, 0, new_width, new_height)
        new_rect.moveCenter(center)
        self.animation.setStartValue(rect)
        self.animation.setEndValue(new_rect)
        self.animation.start()

class VoiceChatThread(QThread):
    finished = pyqtSignal(str)

    def run(self):
        global current_state, is_recording
        current_state = States.RECORDING_USER_INPUT
        is_recording = True
        try:
            recording, fs = record_audio()
            current_state = States.PROCESSING_USER_INPUT
            user_input = transcribe_audio_to_text(recording, fs)
        except Exception as e:
            logging.error(f"Error in VoiceChatThread: {e}")
            user_input = ""
        self.finished.emit(user_input)

class SpeechThread(QThread):
    finished = pyqtSignal()

    def __init__(self, text):
        super().__init__()
        self.text = text

    def run(self):
        try:
            tts = gTTS(text=self.text, lang='en', tld='co.uk')
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            pygame.mixer.init()
            pygame.mixer.music.load(mp3_fp, 'mp3')
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
        except Exception as e:
            logging.error(f"TTS Error: {e}")
            print(f"TTS Error: {e}")
        finally:
            pygame.mixer.quit()
            self.finished.emit()

class DiceRoller:
    @staticmethod
    def roll(dice):
        try:
            num, sides = map(int, dice.lower().split('d'))
            return sum(random.randint(1, sides) for _ in range(num))
        except ValueError:
            return None

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.game_prompt = None
        self.setWindowTitle("Universal Game System")
        self.setGeometry(100, 100, 1600, 1000)

        self.setup_ui()

        self.voice_thread = VoiceChatThread()
        self.voice_thread.finished.connect(self.on_voice_chat_finished)

        self.speech_thread = None

        # Initialize managers
        self.inventory_manager = InventoryManager()
        self.quest_manager = QuestManager()
        self.world_state_manager = WorldStateManager()
        self.knowledge_graph_manager = KnowledgeGraphManager()
        self.combat_system = CombatSystem()
        self.npc_ai = NPCAI(input_size=10, hidden_size=64, output_size=4)
        self.save_load_system = SaveLoadSystem()
        self.network_manager = NetworkManager('localhost', 8765)
        self.procedural_generator = ProceduralGenerator()
        self.help_system = HelpSystem()
        self.documentation_system = DocumentationSystem()
        self.memory_optimizer = MemoryOptimizer()
        self.adaptive_difficulty = AdaptiveDifficulty()

        # Dice rolling system
        self.dice_roller = DiceRoller()
        self.waiting_for_roll = False
        self.current_roll_request = None

        # Set up a timer for random events
        self.event_timer = QTimer(self)
        self.event_timer.timeout.connect(self.trigger_random_event)
        self.event_timer.start(300000)  # Check for random events every 5 minutes

    def setup_ui(self):
        # Set up the main layout
        main_layout = QVBoxLayout()

        # Create and set up the menu bar
        self.setup_menu_bar()

        # Header area
        header_layout = QHBoxLayout()
        self.logo_label = QLabel("UGS")
        self.logo_label.setStyleSheet("font-size: 24px; font-weight: bold;")
        header_layout.addWidget(self.logo_label)
        
        self.title_label = QLabel("Universal Game System")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("font-size: 28px; font-weight: bold;")
        header_layout.addWidget(self.title_label)
        
        self.profile_button = QPushButton("Profile")
        self.profile_button.clicked.connect(self.show_profile)
        header_layout.addWidget(self.profile_button)
        
        main_layout.addLayout(header_layout)

        # Main content area
        content_layout = QHBoxLayout()

        # Left sidebar
        left_sidebar = QWidget()
        left_sidebar.setFixedWidth(200)
        left_sidebar_layout = QVBoxLayout(left_sidebar)
        
        self.chat_history_list = QListWidget()
        left_sidebar_layout.addWidget(QLabel("Chat History"))
        left_sidebar_layout.addWidget(self.chat_history_list)
        
        self.settings_button = QPushButton("Settings")
        self.settings_button.clicked.connect(self.show_settings)
        left_sidebar_layout.addWidget(self.settings_button)
        
        self.help_button = QPushButton("Help")
        self.help_button.clicked.connect(self.show_help)
        left_sidebar_layout.addWidget(self.help_button)
        
        content_layout.addWidget(left_sidebar)

        # Chat area
        chat_widget = QWidget()
        chat_layout = QVBoxLayout(chat_widget)
        
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        chat_layout.addWidget(self.chat_display)
        
        input_layout = QHBoxLayout()
        self.input_box = QTextEdit()
        self.input_box.setFixedHeight(70)
        input_layout.addWidget(self.input_box)
        
        self.send_button = AnimatedButton("Send")
        self.send_button.clicked.connect(self.send_message)
        input_layout.addWidget(self.send_button)
        
        self.voice_button = AnimatedButton("Voice")
        self.voice_button.clicked.connect(self.start_voice_chat)
        input_layout.addWidget(self.voice_button)
        
        self.roll_button = AnimatedButton("Roll")
        self.roll_button.clicked.connect(self.handle_dice_roll)
        input_layout.addWidget(self.roll_button)
        
        chat_layout.addLayout(input_layout)
        
        content_layout.addWidget(chat_widget)

        # Right sidebar
        right_sidebar = QWidget()
        right_sidebar.setFixedWidth(250)
        right_sidebar_layout = QVBoxLayout(right_sidebar)
        
        self.game_info = QTextEdit()
        self.game_info.setReadOnly(True)
        right_sidebar_layout.addWidget(QLabel("Game Info"))
        right_sidebar_layout.addWidget(self.game_info)
        
        self.inventory_display = QListWidget()
        right_sidebar_layout.addWidget(QLabel("Inventory"))
        right_sidebar_layout.addWidget(self.inventory_display)
        
        content_layout.addWidget(right_sidebar)

        main_layout.addLayout(content_layout)

        # Set up the central widget
        central_widget = QWidget()
        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

        # Set up status bar
        self.statusBar().showMessage("Welcome to the Universal Game System")

    def setup_menu_bar(self):
        menubar = self.menuBar()
        
        file_menu = menubar.addMenu('File')
        new_game_action = QAction('New Game', self)
        new_game_action.triggered.connect(self.new_game)
        file_menu.addAction(new_game_action)
        
        load_game_action = QAction('Load Game', self)
        load_game_action.triggered.connect(self.load_game)
        file_menu.addAction(load_game_action)
        
        save_game_action = QAction('Save Game', self)
        save_game_action.triggered.connect(self.save_game)
        file_menu.addAction(save_game_action)
        
        exit_action = QAction('Exit', self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        edit_menu = menubar.addMenu('Edit')
        settings_action = QAction('Settings', self)
        settings_action.triggered.connect(self.show_settings)
        edit_menu.addAction(settings_action)
        
        help_menu = menubar.addMenu('Help')
        help_action = QAction('Help', self)
        help_action.triggered.connect(self.show_help)
        help_menu.addAction(help_action)
        
        about_action = QAction('About', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def new_game(self):
        self.show_prompt_selector()

    def show_prompt_selector(self):
        selector = GamePromptSelector(self)
        if selector.exec_():
            selected_prompt = selector.get_selected_prompt()
            if selected_prompt:
                try:
                    self.game_prompt = GamePromptLoader.load_prompt(selected_prompt)
                    self.title_label.setText(f"Current Game: {selected_prompt}")
                    self.chat_display.clear()
                    self.chat_display.append(f"<span style='color: #00FFFF;'>System:</span> Loaded game prompt: {selected_prompt}")
                    self.generate_ai_response("Start the game and provide an introduction.")
                except Exception as e:
                    logging.error(f"Error loading prompt: {e}")
                    logging.error(traceback.format_exc())
                    QMessageBox.critical(self, "Error", f"Failed to load game prompt: {str(e)}")
            else:
                logging.warning("No prompt selected")
                self.chat_display.append("<span style='color: #FFFF00;'>Warning:</span> No game prompt selected.")
        else:
            logging.info("Prompt selection cancelled")
            self.chat_display.append("<span style='color: #FFFF00;'>Info:</span> Game prompt selection cancelled.")

    @retry_with_exponential_backoff
    def generate_ai_response(self, user_input):
        try:
            context = self.prepare_context()
            
            messages = [{"role": "system", "content": self.game_prompt}] + context + conversation_history[-10:]
            messages.append({"role": "user", "content": user_input})
            
            num_tokens = num_tokens_from_messages(messages)
            max_tokens = min(6000 - num_tokens, 500)

            completion = groq_client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
                top_p=0.95,
            )

            ai_response = completion.choices[0].message.content

            self.chat_display.append(f"<span style='color: #00FFFF;'>AI:</span> {ai_response}")
            self.type_and_speak(ai_response)

            conversation_history.append({"role": "assistant", "content": ai_response})
            
            self.update_session_data(ai_response)
            
            sentiment = self.analyze_sentiment(ai_response)
            self.adaptive_difficulty.adjust_difficulty(sentiment)

            self.world_state_manager.update_from_response(ai_response)

            self.knowledge_graph_manager.update_from_response(ai_response)

            with open(transcript_file, "a") as file:
                file.write(f"\nAI: {ai_response}\n\n")

            if "roll" in ai_response.lower() and "d" in ai_response.lower():
                dice_request = ai_response.split("roll")[-1].strip().split()[0]
                if 'd' in dice_request:
                    self.waiting_for_roll = True
                    self.current_roll_request = dice_request
                    self.chat_display.append(f"<span style='color: #00FFFF;'>AI:</span> Please roll {dice_request}.")
                    return

            self.wait_for_user_input()

        except Exception as e:
            logging.error(f"Error generating AI response: {e}")
            logging.error(traceback.format_exc())
            self.chat_display.append("<span style='color: #FF0000;'>An unexpected error occurred. Please try again.</span>")

    def analyze_sentiment(self, text):
        doc = nlp(text)
        sentiment_score = sum(token.sentiment for token in doc) / len(doc)
        if sentiment_score > 0.2:
            return ("POSITIVE", sentiment_score)
        elif sentiment_score < -0.2:
            return ("NEGATIVE", sentiment_score)
        else:
            return ("NEUTRAL", sentiment_score)

    def wait_for_user_input(self):
        self.input_box.setFocus()
        self.send_button.setText("Send")
        self.send_button.clicked.disconnect()
        self.send_button.clicked.connect(self.send_message)

    def type_and_speak(self, text):
        try:
            words = text.split()
            
            self.speech_thread = SpeechThread(text)
            self.speech_thread.finished.connect(self.on_speech_finished)
            self.speech_thread.start()
            
            for word in words:
                self.chat_display.insertPlainText(word + " ")
                self.chat_display.verticalScrollBar().setValue(self.chat_display.verticalScrollBar().maximum())
                QApplication.processEvents()
                time.sleep(0.01)
            
            self.speech_thread.wait()
        except Exception as e:
            logging.error(f"Error in type_and_speak: {e}")
            print(f"Error in type_and_speak: {e}")

    def on_speech_finished(self):
        print("Speech finished")

    def send_message(self):
        message = self.input_box.toPlainText()
        self.chat_display.append(f"<span style='color: #00FF00;'>You:</span> {message}")
        self.input_box.clear()
        self.process_message(message)

    def start_voice_chat(self):
        self.voice_button.setEnabled(False)
        self.voice_thread.start()

    def on_voice_chat_finished(self, result):
        self.voice_button.setEnabled(True)
        self.chat_display.append(f"<span style='color: #00FF00;'>You (voice):</span> {result}")
        self.process_message(result)

    def process_message(self, message):
        global conversation_history, transcript_file, session_data
        conversation_history.append({"role": "user", "content": message})
        
        session_data["events"].append(f"User input: {message}")
        
        doc = nlp(message)
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        new_location = self.world_state_manager.update_from_message(message, entities)
        if new_location:
            self.update_game_info()
        
        new_items = self.inventory_manager.update_from_message(message, entities)
        if new_items:
            self.update_inventory_display()
        
        self.knowledge_graph_manager.update_from_message(message, entities)
        
        self.quest_manager.update_from_message(message, entities)
        
        with open(transcript_file, "a") as file:
            file.write(f"~~~\n\nUser: {message}\n\n~~~\n")
        
        if self.waiting_for_roll:
            try:
                roll_result = int(message.split()[0])
                self.handle_roll_result(roll_result)
            except ValueError:
                self.chat_display.append("<span style='color: #FF0000;'>Please enter a valid roll result (a number).</span>")
        else:
            self.generate_ai_response(message)

    def handle_dice_roll(self):
        if self.waiting_for_roll and self.current_roll_request:
            result = self.dice_roller.roll(self.current_roll_request)
            if result is not None:
                self.chat_display.append(f"<span style='color: #FF00FF;'>Dice Roll ({self.current_roll_request}):</span> {result}")
                self.handle_roll_result(result)
            else:
                self.chat_display.append("<span style='color: #FF0000;'>Invalid dice format. Use NdM (e.g., 2d6).</span>")

    def handle_roll_result(self, result):
        self.chat_display.append(f"<span style='color: #00FF00;'>You rolled:</span> {result}")
        self.waiting_for_roll = False
        self.current_roll_request = None
        self.generate_ai_response(f"I rolled a {result}.")

    def prepare_context(self):
        context = []
        
        if character_data:
            context.append({"role": "system", "content": f"Character data: {json.dumps(character_data)}"})
        
        if "summaries" in session_data and session_data["summaries"]:
            context.append({"role": "system", "content": f"Recent summary: {session_data['summaries'][-1]}"})
        
        active_quests = self.quest_manager.get_active_quests()
        if active_quests:
            context.append({"role": "system", "content": f"Active quests: {', '.join(active_quests)}"})
        
        world_state = self.world_state_manager.get_current_state()
        if world_state:
            context.append({"role": "system", "content": f"World state: {json.dumps(world_state)}"})
        
        graph_info = self.knowledge_graph_manager.get_relevant_info()
        if graph_info:
            context.append({"role": "system", "content": f"Relevant relationships: {graph_info}"})
        
        difficulty = self.adaptive_difficulty.get_current_difficulty()
        context.append({"role": "system", "content": f"Current difficulty: {difficulty}"})
        
        context.append({"role": "system", "content": "When a dice roll is needed, ask the user to roll and wait for their input. Do not roll for the user."})
        
        return context

    def update_session_data(self, ai_response):
        global session_data
        
        session_data["events"].append(f"AI response: {ai_response}")
        
        self.quest_manager.update_from_response(ai_response)
        
        if len(session_data["events"]) % 5 == 0:
            summary = self.generate_summary()
            if "summaries" not in session_data:
                session_data["summaries"] = []
            session_data["summaries"].append(summary)

    def generate_summary(self):
        recent_events = session_data["events"][-5:]
        full_text = " ".join(recent_events)
        
        summary = summarizer(full_text, max_length=100, min_length=30, do_sample=False)[0]['summary_text']
        
        return summary

    def update_game_info(self):
        world_state = self.world_state_manager.get_current_state()
        active_quests = self.quest_manager.get_active_quests()
        
        info = f"Location: {world_state.get('current_location', 'Unknown')}\n"
        info += f"Time: {world_state.get('time_of_day', 'Unknown')}\n"
        info += f"Weather: {world_state.get('weather', 'Unknown')}\n\n"
        info += f"Active Quests:\n"
        for quest in active_quests:
            info += f"- {quest}\n"
        
        self.game_info.setText(info)

    def update_inventory_display(self):
        inventory = self.inventory_manager.get_inventory("player")
        self.inventory_display.clear()
        for item in inventory:
            self.inventory_display.addItem(item)

    def trigger_random_event(self):
        event = self.procedural_generator.generate_random_event()
        self.chat_display.append(f"<span style='color: #FF00FF;'>Event:</span> {event}")
        self.generate_ai_response(f"Respond to this event: {event}")

    def closeEvent(self, event):
        if self.speech_thread and self.speech_thread.isRunning():
            self.speech_thread.finished.connect(self.speech_thread.deleteLater)
            self.speech_thread.wait()
        save_session_data()
        save_character_data()
        save_knowledge_graph()
        event.accept()

    def show_help(self):
        help_text = self.help_system.get_all_topics()
        QMessageBox.information(self, "Help", help_text)

    def show_documentation(self):
        doc_text = self.documentation_system.get_all_categories()
        QMessageBox.information(self, "Documentation", "\n".join(doc_text))

    def save_game(self):
        file_name, _ = QFileDialog.getSaveFileName(self, "Save Game", "", "Save Files (*.sav)")
        if file_name:
            try:
                self.save_load_system.save_game(self.get_game_state(), file_name)
                self.statusBar().showMessage(f"Game saved to {file_name}", 5000)
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save game: {str(e)}")

    def load_game(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Load Game", "", "Save Files (*.sav)")
        if file_name:
            try:
                game_state = self.save_load_system.load_game(file_name)
                self.set_game_state(game_state)
                self.statusBar().showMessage(f"Game loaded from {file_name}", 5000)
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to load game: {str(e)}")

    def get_game_state(self):
        return {
            "character_data": character_data,
            "session_data": session_data,
            "conversation_history": conversation_history,
            "world_state": self.world_state_manager.get_current_state(),
            "inventory": self.inventory_manager.get_inventory("player"),
            "quests": self.quest_manager.get_active_quests(),
            "knowledge_graph": self.knowledge_graph_manager.graph
        }

    def set_game_state(self, game_state):
        global character_data, session_data, conversation_history
        character_data = game_state["character_data"]
        session_data = game_state["session_data"]
        conversation_history = game_state["conversation_history"]
        self.world_state_manager.set_state(game_state["world_state"])
        self.inventory_manager.set_inventory("player", game_state["inventory"])
        self.quest_manager.set_quests(game_state["quests"])
        self.knowledge_graph_manager.graph = game_state["knowledge_graph"]
        self.update_game_info()
        self.update_inventory_display()
        self.chat_display.clear()
        for message in conversation_history:
            if message["role"] == "user":
                self.chat_display.append(f"<span style='color: #00FF00;'>You:</span> {message['content']}")
            elif message["role"] == "assistant":
                self.chat_display.append(f"<span style='color: #00FFFF;'>AI:</span> {message['content']}")
        self.generate_ai_response("Summarize the current state of the game and our last interaction.")

    def show_settings(self):
        QMessageBox.information(self, "Settings", "Settings dialog not implemented yet.")

    def show_profile(self):
        QMessageBox.information(self, "Profile", "Profile dialog not implemented yet.")

    def show_about(self):
        about_text = "Universal Game System\nVersion 1.0\n\nCreated by Your Name\n\nA dynamic, AI-powered game system."
        QMessageBox.about(self, "About Universal Game System", about_text)

class InventoryManager:
    def __init__(self):
        self.inventories = {"player": []}

    def add_item(self, character, item):
        if character not in self.inventories:
            self.inventories[character] = []
        self.inventories[character].append(item)

    def remove_item(self, character, item):
        if character in self.inventories and item in self.inventories[character]:
            self.inventories[character].remove(item)

    def get_inventory(self, character):
        return self.inventories.get(character, [])

    def update_from_message(self, message, entities):
        new_items = []
        for entity in entities:
            if entity[1] == "OBJECT":
                self.add_item("player", entity[0])
                new_items.append(entity[0])
        return new_items

    def set_inventory(self, character, items):
        self.inventories[character] = items

class QuestManager:
    def __init__(self):
        self.active_quests = []
        self.completed_quests = []

    def add_quest(self, quest):
        if quest not in self.active_quests:
            self.active_quests.append(quest)

    def complete_quest(self, quest):
        if quest in self.active_quests:
            self.active_quests.remove(quest)
            self.completed_quests.append(quest)

    def get_active_quests(self):
        return self.active_quests

    def get_completed_quests(self):
        return self.completed_quests

    def update_from_message(self, message, entities):
        quest_keywords = ["quest", "mission", "task"]
        for entity in entities:
            if entity[1] == "EVENT" and any(keyword in entity[0].lower() for keyword in quest_keywords):
                self.add_quest(entity[0])

    def update_from_response(self, response):
        if "new quest:" in response.lower():
            new_quest = response.split("new quest:")[-1].split(".")[0].strip()
            self.add_quest(new_quest)
        
        if "quest completed:" in response.lower():
            completed_quest = response.split("quest completed:")[-1].split(".")[0].strip()
            self.complete_quest(completed_quest)

    def set_quests(self, quests):
        self.active_quests = quests

class WorldStateManager:
    def __init__(self):
        self.state = {
            "current_location": "Unknown",
            "time_of_day": "Unknown",
            "weather": "Unknown",
            "factions": {},
            "global_events": []
        }

    def update_location(self, location):
        self.state["current_location"] = location

    def update_time(self, time_of_day):
        self.state["time_of_day"] = time_of_day

    def update_weather(self, weather):
        self.state["weather"] = weather

    def update_faction_status(self, faction, status):
        self.state["factions"][faction] = status

    def add_global_event(self, event):
        self.state["global_events"].append(event)

    def get_current_state(self):
        return self.state

    def update_from_message(self, message, entities):
        new_location = None
        for entity in entities:
            if entity[1] == "GPE" or entity[1] == "LOC":
                new_location = entity[0]
                self.update_location(new_location)
            elif entity[1] == "TIME":
                self.update_time(entity[0])
            elif entity[1] == "EVENT":
                self.add_global_event(entity[0])
        return new_location

    def update_from_response(self, response):
        weather_keywords = ["sunny", "rainy", "cloudy", "stormy"]
        for keyword in weather_keywords:
            if keyword in response.lower():
                self.update_weather(keyword)
                break
        
        factions = ["rebels", "empire", "merchants", "cultists"]
        for faction in factions:
            sentiment = TextBlob(response).sentiment.polarity
            status = "friendly" if sentiment > 0 else "hostile" if sentiment < 0 else "neutral"
            self.update_faction_status(faction, status)

    def set_state(self, state):
        self.state = state

class KnowledgeGraphManager:
    def __init__(self):
        self.graph = nx.Graph()

    def add_entity(self, entity):
        if not self.graph.has_node(entity):
            self.graph.add_node(entity)

    def add_relationship(self, entity1, entity2, relationship):
        self.add_entity(entity1)
        self.add_entity(entity2)
        self.graph.add_edge(entity1, entity2, relationship=relationship)

    def get_related_entities(self, entity):
        if entity in self.graph:
            return list(self.graph.neighbors(entity))
        return []

    def get_relevant_info(self):
        relationships = []
        for edge in self.graph.edges(data=True):
            relationships.append(f"{edge[0]} is {edge[2]['relationship']} to {edge[1]}")
        return ". ".join(relationships)

    def update_from_message(self, message, entities):
        for i, entity in enumerate(entities):
            self.add_entity(entity[0])
            if i > 0:
                self.add_relationship(entities[i-1][0], entity[0], "related")

    def update_from_response(self, response):
        doc = nlp(response)
        for sent in doc.sents:
            for token in sent:
                if token.dep_ == "nsubj" and token.head.pos_ == "VERB":
                    subject = token.text
                    verb = token.head.text
                    for child in token.head.children:
                        if child.dep_ == "dobj":
                            object = child.text
                            self.add_relationship(subject, object, verb)

class AdaptiveDifficulty:
    def __init__(self):
        self.difficulty_level = 5
        self.player_performance = []

    def adjust_difficulty(self, sentiment):
        label, score = sentiment
        if label == "POSITIVE":
            self.player_performance.append(1)
        elif label == "NEGATIVE":
            self.player_performance.append(-1)
        else:
            self.player_performance.append(0)

        if len(self.player_performance) >= 5:
            avg_performance = sum(self.player_performance[-5:]) / 5
            if avg_performance > 0.6:
                self.increase_difficulty()
            elif avg_performance < -0.6:
                self.decrease_difficulty()

    def increase_difficulty(self):
        self.difficulty_level = min(10, self.difficulty_level + 1)

    def decrease_difficulty(self):
        self.difficulty_level = max(1, self.difficulty_level - 1)

    def get_current_difficulty(self):
        return self.difficulty_level

class ProceduralGenerator:
    def __init__(self):
        self.location_types = ["city", "forest", "mountain", "desert", "space station", "underwater base"]
        self.character_traits = ["brave", "mysterious", "cunning", "loyal", "treacherous", "wise"]
        self.item_types = ["weapon", "artifact", "tool", "relic", "technology", "potion"]

    def generate_location(self):
        location_type = random.choice(self.location_types)
        adjectives = random.sample(["ancient", "futuristic", "mystical", "dangerous", "peaceful", "chaotic"], 2)
        name = f"The {adjectives[0].capitalize()} {adjectives[1].capitalize()} {location_type.capitalize()}"
        description = f"A {adjectives[0]} and {adjectives[1]} {location_type} that holds many secrets."
        return {"name": name, "type": location_type, "description": description}

    def generate_character(self):
        traits = random.sample(self.character_traits, 2)
        race = random.choice(["human", "alien", "robot", "mutant", "cyborg"])
        occupation = random.choice(["merchant", "explorer", "scientist", "soldier", "artist"])
        name = f"{random.choice(['A', 'B', 'C', 'D', 'X', 'Y', 'Z'])}-{random.randint(100, 999)}"
        description = f"A {traits[0]} and {traits[1]} {race} {occupation} known as {name}."
        return {"name": name, "race": race, "occupation": occupation, "traits": traits, "description": description}

    def generate_item(self):
        item_type = random.choice(self.item_types)
        adjectives = random.sample(["powerful", "ancient", "mysterious", "high-tech", "cursed", "blessed"], 2)
        name = f"The {adjectives[0].capitalize()} {adjectives[1].capitalize()} {item_type.capitalize()}"
        description = f"A {adjectives[0]} and {adjectives[1]} {item_type} with unknown capabilities."
        return {"name": name, "type": item_type, "description": description}

    def generate_random_event(self):
        events = [
            "A mysterious stranger approaches you with an intriguing offer.",
            "You stumble upon an ancient artifact, its purpose unknown.",
            "A distress signal emanates from a nearby abandoned structure.",
            "A sudden atmospheric disturbance reveals a hidden path.",
            "An enigmatic message appears on your communications device.",
        ]
        return random.choice(events)

class CombatSystem:
    def __init__(self):
        self.turn_order = []
        self.current_turn = 0
        self.status_effects = {}

    def start_combat(self, players, enemies):
        self.turn_order = players + enemies
        random.shuffle(self.turn_order)
        self.current_turn = 0
        for entity in self.turn_order:
            self.status_effects[entity] = []
        return f"Combat started! Turn order: {', '.join(entity.name for entity in self.turn_order)}"

    def next_turn(self):
        self.current_turn = (self.current_turn + 1) % len(self.turn_order)
        entity = self.turn_order[self.current_turn]
        self.apply_status_effects(entity)
        return entity

    def apply_status_effects(self, entity):
        for effect in self.status_effects[entity]:
            effect.apply(entity)
            effect.duration -= 1
        self.status_effects[entity] = [effect for effect in self.status_effects[entity] if effect.duration > 0]

    def perform_action(self, actor, action, target):
        result = action.execute(actor, target)
        if action.status_effect:
            self.add_status_effect(target, action.status_effect)
        return result

    def add_status_effect(self, entity, effect):
        self.status_effects[entity].append(effect)

    def is_combat_over(self):
        return len([entity for entity in self.turn_order if entity.is_alive()]) <= 1

    def get_winner(self):
        return next((entity for entity in self.turn_order if entity.is_alive()), None)

class NPCAI(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(NPCAI, self).__init__()
        self.hidden_size = hidden_size
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = torch.softmax(self.fc3(x), dim=1)
        return x

    def decide_action(self, state):
        with torch.no_grad():
            output = self(state)
            return torch.argmax(output).item()

class SaveLoadSystem:
    @staticmethod
    def save_game(game_state, filename):
        with open(filename, 'wb') as f:
            pickle.dump(game_state, f)

    @staticmethod
    def load_game(filename):
        with open(filename, 'rb') as f:
            return pickle.load(f)

class NetworkManager:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.server = None
        self.clients = {}

    async def start_server(self):
        self.server = await asyncio.start_server(self.handle_client, self.host, self.port)
        addr = self.server.sockets[0].getsockname()
        print(f'Serving on {addr}')
        async with self.server:
            await self.server.serve_forever()

    async def handle_client(self, reader, writer):
        addr = writer.get_extra_info('peername')
        client_id = str(uuid.uuid4())
        self.clients[client_id] = {'reader': reader, 'writer': writer}
        print(f"New connection from {addr}")
        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break
                message = data.decode()
                await self.broadcast(message, client_id)
        finally:
            del self.clients[client_id]
            writer.close()
            await writer.wait_closed()
            print(f"Connection closed for {addr}")

    async def broadcast(self, message, sender_id):
        for client_id, client in self.clients.items():
            if client_id != sender_id:
                writer = client['writer']
                writer.write(message.encode())
                await writer.drain()

class HelpSystem:
    def __init__(self):
        self.help_topics = {
            "controls": "Use the text input box to enter commands or messages. Click 'Send' or press Enter to submit.",
            "voice": "Click the 'Voice' button to use voice input. Speak clearly and wait for transcription.",
            "quests": "Quests are displayed in the Game Info panel. Complete them to progress in the game.",
            "inventory": "Your inventory is shown in the right sidebar. Items you collect will appear here.",
            "save": "Use File -> Save Game to save your current game state.",
            "load": "Use File -> Load Game to load a previously saved game.",
            "dice": "When prompted, use the 'Roll' button to make dice rolls.",
            "settings": "Access settings through Edit -> Settings to customize your experience."
        }

    def get_help(self, topic):
        return self.help_topics.get(topic, "Topic not found. Available topics: " + ", ".join(self.help_topics.keys()))

    def get_all_topics(self):
        return "\n".join([f"{topic}: {help_text}" for topic, help_text in self.help_topics.items()])

class DocumentationSystem:
    def __init__(self):
        self.documentation = {
            "game_mechanics": {
                "ai_interaction": "The game uses an AI to generate responses and guide the narrative. Your choices influence the story.",
                "difficulty": "The game adapts its difficulty based on your performance. Challenges will increase or decrease accordingly.",
                "quests": "Quests are dynamically generated and updated based on your actions and the game world state.",
                "inventory": "Your inventory is managed automatically. Items are added when you acquire them in the game."
            },
            "technical_guide": {
                "save_files": "Save files are stored in the 'saves' directory. Each save is a separate file with a .sav extension.",
                "voice_input": "Voice input uses your system's default microphone. Ensure it's properly configured for best results.",
                "performance": "If you experience performance issues, try closing other applications or restarting the game."
            }
        }

    def get_documentation(self, category, topic):
        return self.documentation.get(category, {}).get(topic, "Documentation not found.")

    def get_all_categories(self):
        return list(self.documentation.keys())

    def get_topics_in_category(self, category):
        return list(self.documentation.get(category, {}).keys())

class MemoryOptimizer:
    def __init__(self):
        self.cache = {}
        self.max_cache_size = 1000

    def memoize(self, func):
        def wrapper(*args):
            if args in self.cache:
                return self.cache[args]
            result = func(*args)
            if len(self.cache) >= self.max_cache_size:
                self.cache.pop(next(iter(self.cache)))
            self.cache[args] = result
            return result
        return wrapper

    def clear_cache(self):
        self.cache.clear()

class GamePromptSelector(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Select Game Prompt")
        self.setGeometry(300, 300, 400, 300)
        layout = QVBoxLayout()

        self.prompt_list = QListWidget()
        self.load_prompts()
        layout.addWidget(self.prompt_list)

        self.select_button = QPushButton("Select")
        self.select_button.clicked.connect(self.accept)
        layout.addWidget(self.select_button)

        self.setLayout(layout)

    def load_prompts(self):
        prompt_dir = r"C:\Users\Micha\Desktop\AethoriaWindows - Copy\GamePrompts"
        for folder in os.listdir(prompt_dir):
            folder_path = os.path.join(prompt_dir, folder)
            if os.path.isdir(folder_path):
                self.prompt_list.addItem(folder)

    def get_selected_prompt(self):
        selected_items = self.prompt_list.selectedItems()
        if selected_items:
            return selected_items[0].text()
        return None

class GamePromptLoader:
    @staticmethod
    def load_prompt(prompt_name):
        base_path = r"C:\Users\Micha\Desktop\AethoriaWindows - Copy\GamePrompts"
        prompt_path = os.path.join(base_path, prompt_name)
        
        if not os.path.isdir(prompt_path):
            raise FileNotFoundError(f"Prompt folder not found: {prompt_path}")

        txt_files = [f for f in os.listdir(prompt_path) if f.endswith('.txt')]
        if not txt_files:
            raise FileNotFoundError(f"No .txt file found in {prompt_path}")

        prompt_file = os.path.join(prompt_path, txt_files[0])

        try:
            with open(prompt_file, 'r', encoding='utf-8') as file:
                prompt_content = file.read()
            return prompt_content
        except Exception as e:
            raise IOError(f"Failed to load game prompt: {str(e)}")

def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0301"):
    encoding = tiktoken.encoding_for_model(model)
    num_tokens = 0
    for message in messages:
        num_tokens += 4
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens -= 1
    num_tokens += 2
    return num_tokens

def record_audio():
    global is_recording
    fs = 16000
    duration = 90
    block_duration = 0.1

    def callback(indata, frames, time, status):
        nonlocal audio_data
        if is_recording:
            audio_data.append(indata.copy())

    try:
        is_recording = True
        audio_data = []
        with sd.InputStream(callback=callback, samplerate=fs, channels=1, blocksize=int(fs * block_duration)):
            while is_recording and len(audio_data) * block_duration < duration:
                sd.sleep(int(block_duration * 1000))

        audio_data = np.concatenate(audio_data, axis=0)
        return audio_data, fs
    except Exception as e:
        logging.error(f"Error recording audio: {e}")
        return None, None

def transcribe_audio_to_text(audio_data, sample_rate):
    start_time = time.time()
    temp_dir = './input/'
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = tempfile.mktemp(suffix='.wav', dir=temp_dir)
    try:
        write_wav(temp_file_path, sample_rate, audio_data)
        segments, _ = whisper_model.transcribe(temp_file_path, beam_size=5)
        transcript = " ".join(segment.text for segment in segments)
        print(Fore.GREEN + "User:", transcript)
        end_time = time.time()
        duration = end_time - start_time
        print(f"[Transcription: {duration:.2f} seconds]")
        return transcript
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        return ""
    finally:
        os.remove(temp_file_path)

def setup_new_transcript_file():
    try:
        transcripts_directory = "transcripts"
        os.makedirs(transcripts_directory, exist_ok=True)

        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        transcript_file = f"{transcripts_directory}/transcript_{timestamp}.txt"
        with open(transcript_file, "w") as file:
            file.write(f"Transcription started at {timestamp}\n\n")

        return transcript_file
    except Exception as e:
        logging.error(f"Error setting up new transcript file: {e}")
        return "transcripts/transcript_error.txt"

def save_journal_entry(session_data, transcript_file):
    try:
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        journal_file = f"journals/journal_{timestamp}.txt"
        os.makedirs("journals", exist_ok=True)
        with open(journal_file, "w") as file:
            file.write(f"Session started at {timestamp}\n\n")
            for entry in session_data["events"]:
                file.write(f"{entry}\n")
        with open(transcript_file, "r") as original_file, open(journal_file, "a") as journal_file:
            journal_file.write("\nTranscription:\n")
            journal_file.write(original_file.read())
        return journal_file
    except Exception as e:
        logging.error(f"Error saving journal entry: {e}")
        return "journals/journal_error.txt"

def play_intro_video(video_path):
    print("Intro video playback is currently disabled.")

def load_character_data():
    global character_data
    try:
        with open('character_data.json', 'r') as file:
            character_data = json.load(file)
    except FileNotFoundError:
        character_data = {}
    except Exception as e:
        logging.error(f"Error loading character data: {e}")

def on_enter_press(key):
    global is_recording, current_state
    if key.name == 'enter':
        if current_state == States.WAITING_FOR_USER:
            if main_window.waiting_for_roll:
                main_window.handle_dice_roll()
            else:
                is_recording = True
                current_state = States.RECORDING_USER_INPUT
                print("Recording started. Press Enter to stop.")
        elif current_state == States.RECORDING_USER_INPUT:
            is_recording = False
            current_state = States.PROCESSING_USER_INPUT
            print("Recording stopped. Processing input...")

def save_character_data():
    try:
        with open('character_data.json', 'w') as file:
            json.dump(character_data, file)
    except Exception as e:
        logging.error(f"Error saving character data: {e}")

def load_session_data():
    global session_data
    try:
        with open('session_data.json', 'r') as file:
            session_data = json.load(file)
    except FileNotFoundError:
        session_data = {}
    except Exception as e:
        logging.error(f"Error loading session data: {e}")

def save_session_data():
    try:
        with open('session_data.json', 'w') as file:
            json.dump(session_data, file)
    except Exception as e:
        logging.error(f"Error saving session data: {e}")

def save_knowledge_graph():
    try:
        nx.write_gexf(knowledge_graph_manager.graph, "knowledge_graph.gexf")
    except Exception as e:
        logging.error(f"Error saving knowledge graph: {e}")

def load_knowledge_graph():
    global knowledge_graph_manager
    try:
        if os.path.exists("knowledge_graph.gexf"):
            knowledge_graph_manager.graph = nx.read_gexf("knowledge_graph.gexf")
    except Exception as e:
        logging.error(f"Error loading knowledge graph: {e}")

class UniversalGameSystem:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.main_window = MainWindow()
        self.network_manager = NetworkManager('localhost', 8765)
        self.procedural_generator = ProceduralGenerator()
        self.combat_system = CombatSystem()
        self.save_load_system = SaveLoadSystem()
        self.help_system = HelpSystem()
        self.documentation_system = DocumentationSystem()
        self.memory_optimizer = MemoryOptimizer()
        self.knowledge_graph_manager = KnowledgeGraphManager()

    def run(self):
        try:
            logging.info("Starting intro video playback")
            play_intro_video(intro_video_path)
            logging.info("Intro video playback completed")

            logging.info("Initializing application data")
            load_character_data()
            load_session_data()
            load_knowledge_graph()

            global transcript_file
            transcript_file = setup_new_transcript_file()

            global session_data
            session_data["events"] = []

            logging.info("Applying NeoCyberpunkTheme")
            NeoCyberpunkTheme.apply_theme(self.app)
        
            logging.info("Showing MainWindow")
            self.main_window.show()

            logging.info("Setting up keyboard listener")
            keyboard.on_press(on_enter_press)

            welcome_message = (
                "Welcome to the Universal Game System!\n\n"
                "You are about to embark on an epic journey through countless realms and narratives. "
                "Your choices will shape the very fabric of each universe you explore.\n\n"
                "To begin your adventure, please select a game prompt using the 'Select Game Prompt' button. "
                "Once a game is loaded, you can interact by typing your actions or using the voice chat feature.\n\n"
                "Remember, in these worlds, every decision matters. Are you ready to start your adventure?"
            )
            self.main_window.chat_display.append(f"<span style='color: #00FFFF;'>System:</span> {welcome_message}")

            return self.app.exec_()
        except Exception as e:
            logging.error(f"Unhandled exception in main: {e}")
            logging.error(traceback.format_exc())
            print(f"An error occurred: {e}")
            print("Check the log file for more details.")
            return 1
        finally:
            logging.info("Application shutting down")
            shutdown_event.set()
            save_session_data()
            save_character_data()
            save_knowledge_graph()
            journal_file = save_journal_entry(session_data, transcript_file)
            print(Fore.GREEN + f"\nJournal saved to {journal_file}")

if __name__ == "__main__":
    game_system = UniversalGameSystem()
    sys.exit(game_system.run())
