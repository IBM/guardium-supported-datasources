#!/usr/bin/env python3
"""
ChatbotBridge.py - A bridge between the JavaScript frontend and the AskAny.py backend.
This script receives questions from the frontend and returns responses from AskAny.
"""
import sys
import json
from AskAny import AskAny
import io
import os
from contextlib import redirect_stdout, redirect_stderr

def process_question(question):
    """
    Process a question using AskAny and return the response.
    
    Args:
        question: The question to process
        
    Returns:
        A string containing the response
    """
    try:
        # Redirect stderr to devnull to suppress initialization messages
        with open(os.devnull, 'w') as devnull:
            with redirect_stderr(devnull):
                # Initialize AskAny
                ask_me_any = AskAny()
        
        # Capture stdout to get the response
        captured_output = io.StringIO()
        with redirect_stdout(captured_output):
            ask_me_any.sendQuestions(question)
        
        # Get the captured output
        response = captured_output.getvalue()
        
        # Clean up the response
        response = response.replace("\nQuestion: " + question + "\n" + "-" * 80 + "\n", "")
        
        return response.strip()
    except Exception as e:
        return f"Error processing question: {str(e)}"

def main():
    """
    Main function to handle command line arguments.
    """
    if len(sys.argv) < 2:
        print("Usage: python ChatbotBridge.py 'your question here'")
        sys.exit(1)
    
    # Get the question from command line arguments
    question = sys.argv[1]
    
    # Process the question
    response = process_question(question)
    
    # Return the response as JSON
    print(json.dumps({"response": response}))

if __name__ == "__main__":
    main()

# Made with Bob
