"""
    Generates customer logger
"""
import logging


class ColorFormatter(logging.Formatter):
    """
    Custom formatter to add colors to log messages based on their log level.
    
    Attributes:
        COLORS (dict): A dictionary mapping log levels to their respective ANSI color codes.
        RESET (str): ANSI code to reset the color to default.
    """

    # ANSI escape codes for colors
    COLORS = {
        'DEBUG': '\033[37m',    # White
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m',  # Magenta

    }
    RESET = '\033[0m'  # Reset color

    def __init__(self, fmt=None, datefmt=None, style='%'):
        """
        Initializes the formatter with the given format, date format, and style.
        
        Args:
            fmt (str): The format string.
            datefmt (str): The date format string.
            style (str): The format style.
        """
        super().__init__(fmt, datefmt, style)

    def format(self, record):
        """
        Formats the log record with the appropriate color based on its level.
        
        Args:
            record (logging.LogRecord): The log record to format.
        
        Returns:
            str: The formatted log message with color.
        """
        log_color = self.COLORS.get(record.levelname, self.RESET)
        log_message = super().format(record)
        return f'{log_color}{log_message}{self.RESET}'

def setup_logger(name, level=logging.DEBUG):
    """
    Sets up a logger with the given name and log level,
    and attaches a console handler with color formatting.
    
    Args:
        name (str): The name of the logger.
        level (int): The logging level (e.g., logging.DEBUG, logging.INFO).
    
    Returns:
        logging.Logger: The configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    console_handler = logging.StreamHandler()
    formatter = ColorFormatter(
        '%(asctime)s - %(filename)s:%(funcName)s:%(lineno)d - %(message)s'
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger
