import os
import sys
from groq import Groq
from langchain_huggingface import HuggingFaceEmbeddings as SentenceTransformerEmbeddings
from langchain_chroma import Chroma
import chromadb
import langchain

class MinimalAethoriaRAG:
    def __init__(self, groq_api_key):
        self.client = Groq(api_key=groq_api_key)
        self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vectorstore = Chroma(collection_name="my_collection", embedding_function=self.embedding_function)


if __name__ == "__main__":
    print(f"Python version: {sys.version}")
    print(f"Chromadb version: {chromadb.__version__}")
    print(f"Langchain version: {langchain.__version__}")

    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        print("Error: GROQ_API_KEY environment variable is not set.")
        sys.exit(1)

    try:
        rag_system = MinimalAethoriaRAG(groq_api_key)
        print("Chroma vectorstore initialized successfully")
    except Exception as e:
        print(f"Error initializing Chroma vectorstore: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()