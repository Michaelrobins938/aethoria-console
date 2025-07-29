import os
import logging
from PyQt5.QtWidgets import (QMainWindow, QVBoxLayout, QHBoxLayout, QWidget, QPushButton,
                             QTextEdit, QLabel, QListWidget, QSplitter, QAction, QFileDialog,
                             QMessageBox, QDialog, QSlider)
from PyQt5.QtCore import Qt, QTimer
from qasync import asyncSlot
from managers import WorldStateManager, InventoryManager, QuestManager
from systems import CombatSystem, AdaptiveDifficulty, ProceduralGenerator, WeatherSystem, EconomySystem, FactionSystem, SkillSystem, TimeSystem
from threads import VoiceChatThread
from audio import transcribe_audio_to_text
import json
import numpy as np
import simpleaudio as sa
from TTS.api import TTS

logger = logging.getLogger(__name__)

class MainWindow(QMainWindow):
    def __init__(self, rag_system):
        super().__init__()
        self.rag_system = rag_system
        self.async_helper = AsyncHelper(rag_system)
        self.setup_ui()
        self.game_prompt = None
        self.setWindowTitle("Aethoria Universal Game System")
        self.setGeometry(100, 100, 1600, 1000)

        self.world_state_manager = WorldStateManager()
        self.inventory_manager = InventoryManager()
        self.quest_manager = QuestManager()

        self.combat_system = CombatSystem()
        self.difficulty_system = AdaptiveDifficulty()
        self.procedural_generator = ProceduralGenerator()
        self.weather_system = WeatherSystem()
        self.economy_system = EconomySystem()
        self.faction_system = FactionSystem()
        self.skill_system = SkillSystem()
        self.time_system = TimeSystem()

        self.voice_thread = VoiceChatThread()
        self.voice_thread.finished.connect(self.on_voice_chat_finished)

        self.speech_thread = None
        self.image_thread = None

        try:
            self.tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", 
                           progress_bar=False, 
                           gpu=False)
        except Exception as e:
            logging.error(f"Error initializing TTS: {e}", exc_info=True)
            QMessageBox.critical(self, "Error", f"Failed to initialize Text-to-Speech: {e}")

        self.current_playback = None

        self.world_update_timer = QTimer(self)
        self.world_update_timer.timeout.connect(self.update_world)
        self.world_update_timer.start(60000)

    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # Chat display
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        main_layout.addWidget(self.chat_display)

        # Input area
        input_layout = QHBoxLayout()
        self.input_box = QTextEdit()
        self.input_box.setFixedHeight(50)
        input_layout.addWidget(self.input_box)

        self.send_button = QPushButton("Send")
        self.send_button.clicked.connect(self.send_message_wrapper)
        input_layout.addWidget(self.send_button)

        self.voice_button = QPushButton("Voice Chat")
        self.voice_button.clicked.connect(self.start_voice_chat)
        input_layout.addWidget(self.voice_button)

        main_layout.addLayout(input_layout)

        # Game info and inventory
        info_inventory_layout = QHBoxLayout()
        self.game_info = QTextEdit()
        self.game_info.setReadOnly(True)
        info_inventory_layout.addWidget(self.game_info)

        self.inventory_display = QListWidget()
        info_inventory_layout.addWidget(self.inventory_display)

        main_layout.addLayout(info_inventory_layout)

        # Menu bar
        menubar = self.menuBar()
        file_menu = menubar.addMenu('File')
        
        load_action = QAction('Load Game', self)
        load_action.triggered.connect(self.load_game)
        file_menu.addAction(load_action)
        
        save_action = QAction('Save Game', self)
        save_action.triggered.connect(self.save_game)
        file_menu.addAction(save_action)
        
        load_prompt_action = QAction('Load Game Prompt', self)
        load_prompt_action.triggered.connect(self.load_game_prompt_wrapper)
        file_menu.addAction(load_prompt_action)

        help_menu = menubar.addMenu('Help')
        about_action = QAction('About', self)
        about_action.triggered.connect(self.show_help)
        help_menu.addAction(about_action)

        # Add a button for loading game prompts
        self.load_prompt_button = QPushButton("Load Game Prompt")
        self.load_prompt_button.clicked.connect(self.load_game_prompt_wrapper)
        main_layout.addWidget(self.load_prompt_button)

    @asyncSlot()
    async def send_message_wrapper(self):
        await self.send_message()

    @asyncSlot()
    async def load_game_prompt_wrapper(self):
        await self.load_game_prompt()

    async def send_message(self):
        try:
            user_input = self.input_box.toPlainText()
            self.input_box.clear()
            self.chat_display.append(f"You: {user_input}")
            
            game_state = self.world_state_manager.get_state()
            response = await self.async_helper.generate_response_async(user_input, game_state)
            self.chat_display.append(f"AI: {response}")
            await self.type_and_speak(response)
            
            self.update_game_state(user_input, response)
        except Exception as e:
            logging.exception("Error sending message")
            self.chat_display.append("Aethoria: I apologize, but there was an error processing your input. Please try again.")

    async def load_game_prompt(self):
        try:
            prompt_selector = GamePromptSelector(self)
            if prompt_selector.exec_():
                selected_prompt = prompt_selector.get_selected_prompt()
                if selected_prompt:
                    logging.info(f"Selected prompt: {selected_prompt}")
                    prompt_file = os.path.join("GamePrompts", selected_prompt)
                    if not os.path.exists(prompt_file):
                        raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
                    with open(prompt_file, 'r') as f:
                        prompt_content = f.read()
                    await self.async_helper.load_game_prompt_async(prompt_content)
                    self.game_prompt = selected_prompt  # Store the loaded prompt
                    logging.info("Game prompt loaded and stored")
                    QMessageBox.information(self, "Success", "Game prompt loaded successfully!")
                else:
                    logging.info("No game prompt selected.")
            else:
                logging.info("Prompt selection cancelled.")
        except Exception as e:
            logging.exception("Error loading game prompt")
            QMessageBox.critical(self, "Error", f"Failed to load game prompt: {str(e)}")

    async def type_and_speak(self, text):
        try:
            logging.info(f"Processing TTS for text: {text}")
            words = text.split()

            # Generate audio using TTS
            wav = await asyncio.to_thread(self.tts.tts, text)
            logging.info(f"Audio generated. Shape: {wav.shape}, Type: {wav.dtype}")

            # Convert to int16 format for simpleaudio
            audio_int16 = (np.array(wav) * 32767).astype(np.int16)
            logging.info(f"Audio converted to int16. Shape: {audio_int16.shape}, Type: {audio_int16.dtype}")

            if self.current_playback:
                self.current_playback.stop()

            try:
                self.current_playback = sa.play_buffer(audio_int16, 1, 2, self.tts.synthesizer.output_sample_rate)
                logging.info("Audio playback started")
            except Exception as playback_error:
                logging.error(f"Error during audio playback: {playback_error}", exc_info=True)
                raise

            for word in words:
                self.chat_display.insertPlainText(word + " ")
                self.chat_display.verticalScrollBar().setValue(self.chat_display.verticalScrollBar().maximum())
                await asyncio.sleep(0.05)

            while self.current_playback.is_playing():
                await asyncio.sleep(0.1)

            logging.info("Audio playback completed")

        except Exception as e:
            logging.error(f"Error during TTS processing: {e}", exc_info=True)
            self.handle_tts_error(str(e))

    def handle_tts_error(self, error_message):
        try:
            logging.warning(f"TTS Error: {error_message}")
            QMessageBox.warning(self, "TTS Error", f"An error occurred during text-to-speech conversion: {error_message}")
            self.chat_display.append(f"[TTS Error] {error_message}")
        except Exception as e:
            logging.error("Error during TTS error handling", exc_info=True)

    def start_voice_chat(self):
        try:
            logging.info("Starting voice chat.")
            self.voice_button.setEnabled(False)
            self.voice_thread.start()
        except Exception as e:
            logging.error("Error starting voice chat", exc_info=True)

    def on_voice_chat_finished(self):
        try:
            logging.info("Voice chat finished.")
            self.voice_button.setEnabled(True)
            audio_file = "user_input.wav"
            if os.path.exists(audio_file):
                transcription = transcribe_audio_to_text(audio_file)
                if transcription:
                    self.input_box.setPlainText(transcription)
                    self.send_message_wrapper()
                else:
                    self.chat_display.append("Failed to transcribe audio. Please try again.")
        except Exception as e:
            logging.error("Error processing voice chat completion", exc_info=True)

    def update_game_state(self, user_input, response):
        try:
            logging.info("Updating game state.")
            self.world_state_manager.update_state(user_input, response)
            self.quest_manager.check_quest_progress(user_input, response)
            self.inventory_manager.update_inventory(user_input, response)
            self.update_displays()
        except Exception as e:
            logger.exception("Error updating game state")

    def update_displays(self):
        try:
           logging.info("Updating displays.")
           self.game_info.setPlainText(self.world_state_manager.get_current_state_description())
           self.inventory_display.clear()
           self.inventory_display.addItems(self.inventory_manager.get_inventory_list())
        except Exception as e:
           logger.exception("Error updating displays")

    def update_world(self):
       try:
           logging.info("Updating world state.")
           self.time_system.advance_time(60)
           weather = self.weather_system.update_weather()
           encounter = self.procedural_generator.generate_encounter(player_level=5, difficulty=self.difficulty_system.difficulty)
           logging.info(f"Random encounter generated: {encounter}")
           self.update_displays()
       except Exception as e:
           logger.exception("Error updating world")
           QMessageBox.critical(self, "Error", f"Failed to update world: {str(e)}")

    def save_game(self):
        try:
            file_path, _ = QFileDialog.getSaveFileName(self, "Save Game", "", "JSON Files (*.json)")
            if file_path:
                logging.info(f"Saving game to {file_path}")
                game_data = {
                    'world_state': self.world_state_manager.get_state(),
                    'inventory': self.inventory_manager.get_inventory(),
                    'quests': self.quest_manager.get_quests(),
                    'chat_history': self.chat_display.toPlainText()
                }
                with open(file_path, 'w') as f:
                    json.dump(game_data, f)
                self.statusBar().showMessage(f"Game saved to {file_path}", 3000)
        except Exception as e:
            logging.error(f"Error saving game to {file_path}", exc_info=True)
            QMessageBox.critical(self, "Error", f"Failed to save game: {e}")

    def load_game(self):
        try:
            file_path, _ = QFileDialog.getOpenFileName(self, "Load Game", "", "JSON Files (*.json)")
            if file_path:
                logging.info(f"Loading game from {file_path}")
                with open(file_path, 'r') as f:
                    game_data = json.load(f)

                self.world_state_manager.set_state(game_data['world_state'])
                self.inventory_manager.set_inventory(game_data['inventory'])
                self.quest_manager.set_quests(game_data['quests'])
                self.chat_display.setPlainText(game_data['chat_history'])

                self.update_displays()
                self.statusBar().showMessage(f"Game loaded from {file_path}", 3000)
        except Exception as e:
            logging.error(f"Error loading game from {file_path}", exc_info=True)
            QMessageBox.critical(self, "Error", f"Failed to load game: {e}")

    def show_help(self):
        try:
            help_text = """
            Welcome to Aethoria Universal Game System!
            
            - Type your actions or questions in the input box and click 'Send' or press Enter.
            - Use the 'Voice Chat' button to speak your input.
            - Save and load your game progress using the File menu.
            - Explore, complete quests, and interact with the world of Aethoria!
            - Load game prompts to set different scenarios or game worlds.
            - Enjoy the text-to-speech feature for AI responses.
            
            For more information, visit our website or contact support.
            """
            logging.info("Displaying help information.")
            QMessageBox.information(self, "Help", help_text)
        except Exception as e:
            logging.error("Error displaying help information", exc_info=True)

class GamePromptSelector(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Select Game Prompt")
        self.setGeometry(300, 300, 300, 400)

        layout = QVBoxLayout()

        self.prompt_list = QListWidget()
        layout.addWidget(self.prompt_list)

        self.load_button = QPushButton("Load")
        self.load_button.clicked.connect(self.accept)
        layout.addWidget(self.load_button)

        self.setLayout(layout)

        self.load_prompts()

    def load_prompts(self):
        prompt_dir = os.path.join(os.path.dirname(__file__), "GamePrompts")
        if os.path.exists(prompt_dir):
            for file in os.listdir(prompt_dir):
                if file.endswith(".txt"):
                                        self.prompt_list.addItem(file)

    def get_selected_prompt(self):
        if self.prompt_list.currentItem():
            return self.prompt_list.currentItem().text()
        return None

class AsyncHelper:
    def __init__(self, rag_system):
        self.rag_system = rag_system

    async def load_game_prompt_async(self, prompt_content):
        try:
            await self.rag_system.load_game_prompt_async(prompt_content)
            logger.info("Game prompt loaded successfully")
        except Exception as e:
            logger.exception("Failed to load and index game prompt")
            raise

    async def generate_response_async(self, user_input, game_state):
        try:
            response = await self.rag_system.generate_response_async(user_input, game_state)
            return response
        except Exception as e:
            logger.exception(f"Error processing user input: {user_input}")
            return "Sorry, there was an error processing your input."