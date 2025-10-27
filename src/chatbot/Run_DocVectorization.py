#!/usr/bin/env python3
"""
Run Markdown Vectorization

This script vectorizes markdown files in the doc directory and saves the vectors
to the vectors directory.
"""

import os
import sys
import argparse
from pathlib import Path
import logging
from config import CUSTOM_MODEL
# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

# Import the MarkdownVectorizer
try:
    from VectorizeDoc import MarkdownVectorizer
except ImportError:
    logger.error("Could not import MarkdownVectorizer. Make sure the file exists.")
    sys.exit(1)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Vectorize markdown files")
    parser.add_argument(
        "--doc-dir", 
        default="doc",
        help="Directory containing markdown files to vectorize"
    )
    parser.add_argument(
        "--output-dir", 
        default=CUSTOM_MODEL,
        help="Directory to save vectors"
    )
    parser.add_argument(
        "--model-name", 
        default="all-MiniLM-L6-v2",
        help="Name of the sentence-transformers model to use"
    )
    parser.add_argument(
        "--prefix", 
        default="customdoc",
        help="Prefix for output files"
    )
    return parser.parse_args()

def main():
    """Main function to run markdown vectorization."""
    args = parse_args()
    
    # Ensure directories exist
    doc_dir = args.doc_dir
    output_dir = args.output_dir
    
    if not os.path.exists(doc_dir):
        logger.error(f"Document directory does not exist: {doc_dir}")
        sys.exit(1)
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize vectorizer
    try:
        logger.info(f"Initializing MarkdownVectorizer with model: {args.model_name}")
        vectorizer = MarkdownVectorizer(model_name=args.model_name)
    except Exception as e:
        logger.error(f"Error initializing vectorizer: {e}")
        sys.exit(1)
    
    # Vectorize markdown files
    try:
        logger.info(f"Vectorizing markdown files in {doc_dir}")
        vectors = vectorizer.vectorize_markdown_directory(doc_dir)
        logger.info(f"Vectorized {len(vectors)} chunks from markdown files")
    except Exception as e:
        logger.error(f"Error vectorizing markdown files: {e}")
        sys.exit(1)
    
    # Save vectors
    try:
        logger.info(f"Saving vectors to {output_dir} with prefix {args.prefix}")
        vectorizer.save_vectors(output_dir, args.prefix)
        logger.info("Vectors saved successfully")
    except Exception as e:
        logger.error(f"Error saving vectors: {e}")
        sys.exit(1)
    
    logger.info("Markdown vectorization completed successfully")

if __name__ == "__main__":
    main()

# Made with Bob
