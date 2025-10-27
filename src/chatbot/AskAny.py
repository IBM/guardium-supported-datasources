#!/usr/bin/env python3
"""
AskAny - An interactive question answering script using the IBM Granite model.
This script provides a command-line interface for asking questions to the model.
"""

import os
import sys
import argparse
import json
import logging
from typing import Dict, List, Optional, Union, Any
from pathlib import Path
from model_reader import ModelReader
import time

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our modules
from model_reader import ModelReader

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class AskAny:
    """
    A class for interactive question answering using the IBM Granite model.
    """
    
    def __init__(self):
        self.model_reader = ModelReader()
    
    def sendQuestions(self, question):
        answer=self.model_reader.AnswerAny(question)
        if not answer:
            print("Sorry, No Information Available.")
        else:
            print("Answer: ",answer)
        return answer
    
    def load_documents(self, doc_dir, recursive=False, max_files=None):
        """
        Placeholder for loading documents - not implemented in this version
        """
        print(f"Document loading not implemented in this version")
        
    def interactive_mode(self):
        """
        Placeholder for interactive mode - not implemented in this version
        """
        print(f"Interactive mode not implemented in this version")

    
def main():
    """
    Main function to run AskAny.
    """
    parser = argparse.ArgumentParser(description="AskAny - Interactive Question Answering")
    parser.add_argument("--question", "-q", type=str,
                        help="Question to answer (if not provided, run in interactive mode)")
    parser.add_argument("--recursive", "-r", action="store_true",
                        help="Process directories recursively")
    parser.add_argument("--temperature", "-t", type=float, default=0.1,
                        help="Temperature for sampling (higher = more creative)")
    parser.add_argument("--max-length", type=int, default=4096,
                        help="Maximum length of the generated answer (including prompt)")
    parser.add_argument("--max-new-tokens", type=int, default=1024,
                        help="Maximum number of new tokens to generate")
    
    args = parser.parse_args()
    
    try:
        # Initialize AskAny
        ask_any = AskAny()
      
        # If question provided, answer it and exit
        if args.question:
            try:
                print("Thinking....")
                start_time = time.time()
                question=args.question
                answer=ask_any.sendQuestions(question)
                end_time = time.time()
            
                #print("Time taken: ",end_time-start_time)
            except Exception as e:
                print(f"Error querying models: {str(e)}")
        else:
            # Otherwise, run in interactive mode
            print("Interactive mode")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
