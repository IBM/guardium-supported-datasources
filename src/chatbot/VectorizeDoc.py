"""
Markdown Vectorizer Module

This module provides functionality to vectorize Markdown data and query it.
It converts Markdown content into vector embeddings that can be searched and retrieved.
"""

import os
import sys
import numpy as np
from typing import Dict, List, Tuple, Any
from sentence_transformers import SentenceTransformer
import pickle
import logging
import re
from pathlib import Path
# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MarkdownVectorizer:
    """A class for vectorizing Markdown data and providing query capabilities."""
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """Initialize the MarkdownVectorizer with a specified embedding model."""
        logger.info(f"Initializing MarkdownVectorizer with model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.vectors = {}
        self.text_to_vector_map = {}
        self.vector_to_text_map = {}
        
    def load_markdown(self, markdown_path: str) -> str:
        """Load Markdown data from a file."""
        logger.info(f"Loading Markdown from: {markdown_path}")
        try:
            with open(markdown_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Failed to read Markdown file: {markdown_path}, Error: {e}")
            raise ValueError(f"Failed to read Markdown file: {markdown_path}")
    
    def _chunk_markdown(self, markdown_text: str, max_chunk_size: int = 1000) -> List[Tuple[str, str]]:
        """Split markdown text into manageable chunks for vectorization."""
        chunks = []
        
        # Split by headers first
        header_pattern = r'^(#{1,6})\s+(.+)$'
        sections = []
        current_section = []
        current_header = "document_start"
        
        for line in markdown_text.split('\n'):
            header_match = re.match(header_pattern, line)
            if header_match:
                # Save previous section if it exists
                if current_section:
                    sections.append((current_header, '\n'.join(current_section)))
                
                # Start new section
                current_header = line.strip()
                current_section = []
            else:
                current_section.append(line)
        
        # Add the last section
        if current_section:
            sections.append((current_header, '\n'.join(current_section)))
        
        # Further chunk large sections
        for header, content in sections:
            if len(content) <= max_chunk_size:
                chunks.append((header, content))
            else:
                # Split large sections into paragraphs
                paragraphs = re.split(r'\n\s*\n', content)
                current_chunk = []
                current_chunk_size = 0
                chunk_index = 0
                
                for para in paragraphs:
                    if current_chunk_size + len(para) > max_chunk_size and current_chunk:
                        # Save current chunk and start a new one
                        chunk_text = '\n\n'.join(current_chunk)
                        chunks.append((f"{header}_chunk_{chunk_index}", chunk_text))
                        chunk_index += 1
                        current_chunk = []
                        current_chunk_size = 0
                    
                    current_chunk.append(para)
                    current_chunk_size += len(para)
                
                # Add the last chunk
                if current_chunk:
                    chunk_text = '\n\n'.join(current_chunk)
                    chunks.append((f"{header}_chunk_{chunk_index}", chunk_text))
        
        logger.info(f"Split markdown into {len(chunks)} chunks")
        return chunks
    
    def vectorize_markdown(self, markdown_text: str, file_path: str = "") -> Dict[str, np.ndarray]:
        """Vectorize the Markdown data."""
        logger.info("Chunking markdown text")
        chunks = self._chunk_markdown(markdown_text)
        
        # Extract texts for vectorization
        chunk_ids = [f"{file_path}:{chunk_id}" if file_path else chunk_id for chunk_id, _ in chunks]
        texts = [chunk_text for _, chunk_text in chunks]
        
        logger.info(f"Vectorizing {len(texts)} markdown chunks")
        embeddings = self.model.encode(texts)
        
        # Create mappings
        vectors = {}
        for i, (chunk_id, chunk_text) in enumerate(zip(chunk_ids, texts)):
            vector = embeddings[i]
            vectors[chunk_id] = vector
            self.text_to_vector_map[chunk_text] = vector
            # Use the string representation of the vector as a key
            vector_key = str(vector.tobytes())
            self.vector_to_text_map[vector_key] = chunk_text
            
        self.vectors.update(vectors)
        return vectors
    
    def vectorize_markdown_directory(self, directory_path: str) -> Dict[str, np.ndarray]:
        """Vectorize all markdown files in a directory."""
        logger.info(f"Vectorizing markdown files in directory: {directory_path}")
        all_vectors = {}
        
        # Find all markdown files
        markdown_files = list(Path(directory_path).glob("**/*.md"))
        
        if not markdown_files:
            logger.warning(f"No markdown files found in {directory_path}")
            return all_vectors
        
        logger.info(f"Found {len(markdown_files)} markdown files")
        
        # Process each file
        for file_path in markdown_files:
            try:
                markdown_text = self.load_markdown(str(file_path))
                relative_path = os.path.relpath(file_path, directory_path)
                file_vectors = self.vectorize_markdown(markdown_text, relative_path)
                all_vectors.update(file_vectors)
                logger.info(f"Vectorized {len(file_vectors)} chunks from {relative_path}")
            except Exception as e:
                logger.error(f"Error vectorizing {file_path}: {e}")
        
        return all_vectors
    
    def save_vectors(self, output_dir: str, prefix: str = "markdown_model") -> None:
        """Save the vectorized data to disk."""
        os.makedirs(output_dir, exist_ok=True)
        
        # Save vectors
        vectors_path = os.path.join(output_dir, f"{prefix}_vectors.pkl")
        with open(vectors_path, 'wb') as f:
            pickle.dump(self.vectors, f)
        
        # Save text-to-vector mapping
        text_to_vector_path = os.path.join(output_dir, f"{prefix}_text_to_vector.pkl")
        with open(text_to_vector_path, 'wb') as f:
            pickle.dump(self.text_to_vector_map, f)
        
        # Save vector-to-text mapping
        vector_to_text_path = os.path.join(output_dir, f"{prefix}_vector_to_text.pkl")
        with open(vector_to_text_path, 'wb') as f:
            pickle.dump(self.vector_to_text_map, f)
            
        logger.info(f"Saved vectors and mappings to {output_dir}")
    
    def load_vectors(self, input_dir: str, prefix: str = "markdown_model") -> None:
        """Load vectorized data from disk."""
        # Load vectors
        vectors_path = os.path.join(input_dir, f"{prefix}_vectors.pkl")
        with open(vectors_path, 'rb') as f:
            self.vectors = pickle.load(f)
        
        # Load text-to-vector mapping
        text_to_vector_path = os.path.join(input_dir, f"{prefix}_text_to_vector.pkl")
        with open(text_to_vector_path, 'rb') as f:
            self.text_to_vector_map = pickle.load(f)
        
        # Load vector-to-text mapping
        vector_to_text_path = os.path.join(input_dir, f"{prefix}_vector_to_text.pkl")
        with open(vector_to_text_path, 'rb') as f:
            self.vector_to_text_map = pickle.load(f)
            
        logger.info(f"Loaded vectors and mappings from {input_dir}")
    
    def query_by_text(self, query_text: str, top_k: int = 5) -> List[Tuple[str, float, str]]:
        """Query the vectorized data by text."""
        # Encode the query text
        query_vector = self.model.encode(query_text)
        
        # Calculate similarities
        similarities = []
        for chunk_id, vector in self.vectors.items():
            similarity = self._cosine_similarity(query_vector, vector)
            chunk_text = self.vector_to_text(vector)
            similarities.append((chunk_id, similarity, chunk_text))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]
    
    def vector_to_text(self, vector: np.ndarray) -> str:
        """Convert a vector back to its original text."""
        vector_key = str(vector.tobytes())
        return self.vector_to_text_map.get(vector_key, "Unknown text")
    
    def _cosine_similarity(self, vec1, vec2) -> float:
        """Calculate cosine similarity between two vectors."""
        # Convert to numpy if needed
        if hasattr(vec1, 'numpy'):
            vec1 = vec1.numpy()
        if hasattr(vec2, 'numpy'):
            vec2 = vec2.numpy()
            
        # Ensure we're working with numpy arrays
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        # Calculate cosine similarity
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# Made with Bob
