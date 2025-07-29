import logging
import os

# Configure logging
log_filename = 'application_error.log'
logging.basicConfig(
    level=logging.DEBUG,  # Log level can be set to DEBUG, INFO, WARNING, ERROR, CRITICAL
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)

def log_uncaught_exceptions(exctype, value, tb):
    logging.critical("Uncaught exception", exc_info=(exctype, value, tb))

# Catch unhandled exceptions and log them
sys.excepthook = log_uncaught_exceptions
