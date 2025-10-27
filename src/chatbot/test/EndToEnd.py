#!/usr/bin/env python3
"""
EndToEnd.py - Test script to process questions from TrainQuestions.txt using AskAny.py in non-interactive mode
"""

import os
import sys
import argparse
import logging
from datetime import datetime
import json
import time

# Add the parent directory to the path to import our modules
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
sys.path.append(parent_dir)

# Import our modules
try:
    from AskAny import AskAny
except ImportError:
    # Try with absolute import
    sys.path.append(os.path.dirname(parent_dir))
    from src.chatbot.AskAny import AskAny

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def read_questions(file_path):
    """
    Read questions from a text file.
    
    Args:
        file_path: Path to the file containing questions
        
    Returns:
        List of questions
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            questions = [line.strip() for line in f if line.strip()]
        return questions
    except Exception as e:
        logger.error(f"Error reading questions file: {str(e)}")
        return []

def main():
    """
    Main function to run the end-to-end test.
    """
    parser = argparse.ArgumentParser(description="EndToEnd - Test questions from TrainQuestions.txt using AskAny.py")
    parser.add_argument("--questions", "-q", type=str, default="TrainQuestions.txt",
                        help="Path to the file containing questions")
  
    args = parser.parse_args()
    
    try:
        # Resolve paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        questions_path = os.path.join(script_dir, args.questions)
        output_dir = os.path.join(script_dir, "output")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Read questions
        questions = read_questions(questions_path)
        if not questions:
            logger.error(f"No questions found in {questions_path}")
            return
        
        logger.info(f"Found {len(questions)} questions in {questions_path}")
        
        ask_any = AskAny()
        
        # Create output file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(output_dir, f"results_{timestamp}.txt")
        output_tfile = os.path.join(output_dir, f"Train{timestamp}.txt")
        with open(output_tfile, 'w', encoding='utf-8') as f:
            f.write(f"")
        data={}    
        data["data"] = {}
        qanssess=[]
        data["data"]=qanssess
        # Process each question
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# EndToEnd Test Results - {timestamp}\n\n")
            
            for i, question in enumerate(questions, 1):
                logger.info(f"Processing question {i}/{len(questions)}: {question}")
                f.write(f"## Question {i}: {question}\n\n")
                
                try:
                    start_time = time.time()
                    answer=ask_any.sendQuestions(question)
                    end_time = time.time()
                    f.write(f"Answer: {answer}\n")
                    f.write(f"Time taken: {end_time - start_time:.2f} seconds\n\n")
                    f.write("---\n\n")
                    qanssessind={}  
                    qanssessind["question"]=question
                    qanssessind["answer"]=answer
                    qanssess.append(qanssessind)
                except Exception as e:
                    logger.error(f"Error processing question: {str(e)}")
                    f.write(f"### Error:\n{str(e)}\n\n")
                    f.write("---\n\n")
        
        logger.info(f"Results saved to {output_file}")
        with open(output_tfile, 'a', encoding='utf-8') as fad:
            fad.write(f"{json.dumps(qanssess,indent=4)}")   
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

# Made with Bob
