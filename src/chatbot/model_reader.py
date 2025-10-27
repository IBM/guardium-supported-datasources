#!/usr/bin/env python3
"""
ModelReader - A class to load and interact with the IBM Granite model.
This module provides functionality to load the Granite model and use it for answering questions.
It also supports loading and querying vector models from the vectors directory.
"""

import os
import sys
from transformers import pipeline
from transformers.generation.utils import GenerateOutput
import torch
from typing import Dict, List, Optional, Union, Any, Tuple
import logging
import json
import glob
import numpy as np
import pickle
from pathlib import Path
from NlpQuestion import NlpQuestionAnalyzer
import re
from regex import F
from config import CUSTOM_MODEL,VECTOR_MODEL,GRANITE_MODEL,CONFIDENCE_SCORE
from ReadJSON import readModelFile
import threading
import queue
import tqdm

# Set up logging
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
class ModelReader:
    """
    A class to load and interact with the IBM Granite model for question answering.
    Also supports loading custom models from JSON/HTML files and vector models.
    """
    
    def __init__(self):
        """
        Initialize the ModelReader with the path to the Granite model.
        
        Args:
            model_path: Path to the Granite model directory
            custom_model_dir: Directory containing custom models
            vector_model_dir: Directory containing vector models
        """
        self.model_path = GRANITE_MODEL
        #print(f"Model path: {self.model_path}")
        self.custom_model_dir = CUSTOM_MODEL
        self.vector_model_dir = VECTOR_MODEL
        self.model = None
        self.tokenizer = None
        self.bert_model = None
        self.bert_tokenizer = None
        self.custom_models = {}
        self.vector_models = {}
        self.vectors = {}
        self.text_to_vector_map = {}
        self.vector_to_text_map = {}
        self.sentence_transformer = None
        tqdm.tqdm = lambda *args, **kwargs: iter(args[0])
        # Try to load the Granite model
        try:
            #print("disabling granite")
            self._load_model()
        except Exception as e:
            logger.warning(f"Could not load Granite model: {str(e)}")
            logger.info("Continuing without Granite model. Vector models will still be available.")
        
        # Try to load the BERT model
        try:
            self._load_bert_model()
        except Exception as e:
            logger.warning(f"Could not load BERT model: {str(e)}")
            logger.info("Continuing without BERT model. Other models will still be available.")
        
        # Load custom models
        self._load_custom_models()
        
        # Load vector models
        self._load_vector_models()
    
    def _load_model(self) -> None:
        """
        Load the Granite model and tokenizer.
        
        Raises:
            ImportError: If required libraries are not installed
            FileNotFoundError: If the model path does not exist
        """
        try:
            # Try to import the required libraries
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
            
            # Check if model path exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(
                    f"Model path '{self.model_path}' does not exist. "
                    f"Please download the model first. See README for instructions."
                )
            
            logger.info(f"Loading model from {self.model_path}...")
            
            # Load the model and tokenizer
            logging.getLogger("transformers").setLevel(logging.ERROR)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            # Load model with appropriate settings for inference
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                local_files_only=True,
                dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto",
                trust_remote_code=True
            )
            
            logger.info("Model loaded successfully")
            
        except ImportError as e:
            logger.error(f"Required libraries not installed: {str(e)}")
            logger.info("Please install the required libraries with: pip install torch transformers")
            raise
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def _load_bert_model(self) -> None:
        """
        Load the BERT model trained for question answering.
        """
        try:
            # Try to import the required libraries
            import torch
            from transformers import AutoModelForQuestionAnswering, AutoTokenizer
            
            # Check if model files exist in the custom model directory
            model_path = self.custom_model_dir
            if not os.path.exists(os.path.join(model_path, "model.safetensors")):
                logger.warning(f"BERT model files not found in {model_path}")
                return
            
            logger.info(f"Loading BERT model from {model_path}...")
            
            # Load the model and tokenizer
            self.bert_tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.bert_model = AutoModelForQuestionAnswering.from_pretrained(model_path)
            
            logger.info("BERT model loaded successfully")
            
        except ImportError as e:
            logger.error(f"Required libraries not installed: {str(e)}")
            logger.info("Please install the required libraries with: pip install torch transformers")
            raise
        except Exception as e:
            logger.error(f"Error loading BERT model: {str(e)}")
            raise
    
    def _load_custom_models(self) -> None:
        """
        Load all custom models from the custom model directory.
        """
        try:
            # Ensure custom model directory exists
            if not os.path.exists(self.custom_model_dir):
                logger.warning(f"Custom model directory {self.custom_model_dir} does not exist")
                os.makedirs(self.custom_model_dir, exist_ok=True)
                logger.info(f"Created custom model directory: {self.custom_model_dir}")
            
            # Find all JSON files in the custom model directory
            custom_model_pattern = os.path.join(self.custom_model_dir, "*.json")
            custom_model_files = glob.glob(custom_model_pattern)
            
            # Also look for pickle files that might contain model data
            pickle_pattern = os.path.join(self.custom_model_dir, "*.pkl")
            pickle_files = glob.glob(pickle_pattern)
            
            # Log what we found
            logger.info(f"Found {len(custom_model_files)} JSON files and {len(pickle_files)} pickle files in {self.custom_model_dir}")
            
            if not custom_model_files and not pickle_files:
                logger.warning(f"No custom models found in {self.custom_model_dir}")
                
                # Try alternative path as fallback
                alt_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "model/custom")
                if os.path.exists(alt_path):
                    logger.info(f"Trying alternative path: {alt_path}")
                    custom_model_pattern = os.path.join(alt_path, "*.json")
                    custom_model_files = glob.glob(custom_model_pattern)
                    if custom_model_files:
                        logger.info(f"Found {len(custom_model_files)} JSON files in alternative path")
                        self.custom_model_dir = alt_path
            
            # Load each custom model (JSON files)
            for model_file in custom_model_files:
                try:
                    with open(model_file, 'r', encoding='utf-8') as f:
                        model_data = json.load(f)
                    
                    model_name = os.path.basename(model_file)
                    self.custom_models[model_name] = model_data
                    logger.info(f"Loaded custom model: {model_name}")
                    
                except Exception as e:
                    logger.warning(f"Failed to load custom model {model_file}: {str(e)}")
            
            # Handle pickle files separately if needed
            # These are typically handled by _load_vector_models but we log them here
            for pkl_file in pickle_files:
                logger.info(f"Found pickle file: {os.path.basename(pkl_file)}")
            
            logger.info(f"Loaded {len(self.custom_models)} custom models")
            
        except Exception as e:
            logger.error(f"Error loading custom models: {str(e)}")
            logger.info(f"Will continue with available models")
    
    def _load_vector_models(self) -> None:
        """
        Load all vector models from the vector model directory.
        """
        try:
            # Ensure vector model directory exists
            os.makedirs(self.vector_model_dir, exist_ok=True)
            
            # Find all vector model files (ending with _vectors.pkl)
            vector_files = glob.glob(os.path.join(self.vector_model_dir, "*_vectors.pkl"))
            if not vector_files:
                logger.info(f"No vector models found in {self.vector_model_dir}")
                return
            
            # Extract model names from filenames
            model_names = [os.path.basename(f).replace('_vectors.pkl', '') for f in vector_files]
            
            # Load each vector model
            for model_name in model_names:
                try:
                    self._load_vector_model(self.vector_model_dir, model_name)
                except Exception as e:
                    logger.warning(f"Failed to load vector model {model_name}: {str(e)}")
            
            logger.info(f"Loaded {len(self.vector_models)} vector models")
            
        except Exception as e:
            logger.error(f"Error loading vector models: {str(e)}")
    
    def _load_vector_model(self, vectors_dir: str, model_name: str) -> bool:
        """
        Load a specific vector model.
        
        Args:
            vectors_dir: Directory containing the vectors
            model_name: Name of the model to load (prefix used in filenames)
            
        Returns:
            True if model was loaded successfully, False otherwise
        """
        try:
            # Check if required files exist
            vectors_path = os.path.join(vectors_dir, f"{model_name}_vectors.pkl")
            text_to_vector_path = os.path.join(vectors_dir, f"{model_name}_text_to_vector.pkl")
            vector_to_text_path = os.path.join(vectors_dir, f"{model_name}_vector_to_text.pkl")
            
            if not all(os.path.exists(p) for p in [vectors_path, text_to_vector_path, vector_to_text_path]):
                logger.warning(f"Missing vector files for model: {model_name}")
                return False
            
            # Load vectors
            with open(vectors_path, 'rb') as f:
                vectors = pickle.load(f)
            
            # Load text-to-vector mapping
            with open(text_to_vector_path, 'rb') as f:
                text_to_vector_map = pickle.load(f)
            
            # Load vector-to-text mapping
            with open(vector_to_text_path, 'rb') as f:
                vector_to_text_map = pickle.load(f)
            
            # Store the model data
            self.vector_models[model_name] = {
                'vectors': vectors,
                'text_to_vector_map': text_to_vector_map,
                'vector_to_text_map': vector_to_text_map
            }
            
            # Update combined dictionaries with prefixed keys
            for path, vector in vectors.items():
                prefixed_path = f"{model_name}:{path}"
                self.vectors[prefixed_path] = vector
            
            for text, vector in text_to_vector_map.items():
                if text not in self.text_to_vector_map:
                    self.text_to_vector_map[text] = []
                self.text_to_vector_map[text].append((model_name, vector))
            
            for vector_key, text in vector_to_text_map.items():
                self.vector_to_text_map[f"{model_name}:{vector_key}"] = text
            
            logger.info(f"Successfully loaded vector model: {model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading vector model {model_name}: {str(e)}")
            return False
    
    def _initialize_sentence_transformer(self) -> None:
        """
        Initialize the sentence transformer model for vector queries.
        """
        if self.sentence_transformer is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("Initializing SentenceTransformer model...")
                self.sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("SentenceTransformer initialized successfully")
            except ImportError:
                logger.error("sentence-transformers not installed")
                logger.info("Please install with: pip install sentence-transformers")
                raise
    
    def answer_question(self, question: str, context: Optional[str] = None,
                        max_length: int = 8192, max_new_tokens: int = 1024, temperature: float = 0.1) -> str:
        """
        Answer a question using the Granite model.
        
        Args:
            question: The question to answer
            context: Optional context to provide to the model
            max_length: Maximum length of the generated answer (including prompt)
            max_new_tokens: Maximum number of new tokens to generate
            temperature: Temperature for sampling (higher = more creative)
            
        Returns:
            The model's answer to the question
            
        Raises:
            RuntimeError: If the model is not loaded
        """      
        # Fall back to Granite model if available
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Granite model not loaded. Please ensure the model is properly initialized.")
        
        try:
            import torch
            
            # Prepare the prompt with explicit instructions to list all versions
            if context:
                prompt = f"Context: {context}\n\nQuestion: {question}\n\nAnswer:"
            else:
                prompt = f"Question: {question}\n\nAnswer:"
            print(f"Prompt:={prompt}")
            # Tokenize the prompt
            inputs = self.tokenizer(prompt, return_tensors="pt")
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
            print(f"inputs: {inputs}")
            # Generate the answer
            with torch.no_grad():
                # Use max_new_tokens if provided, otherwise fall back to max_length
                generation_kwargs = {
                    "temperature": temperature,
                    "do_sample": temperature > 0,
                    "pad_token_id": self.tokenizer.eos_token_id,
                    # Add timeout parameter to prevent hanging
                    "max_time": 30.0  # 30 seconds timeout
                }
                
                # Only use one of max_new_tokens or max_length to avoid warnings
                if max_new_tokens > 0:
                    generation_kwargs["max_new_tokens"] = max_new_tokens
                else:
                    generation_kwargs["max_length"] = max_length
                
                print("Starting model generation...")
                # Generate output without type annotation
                output = self.model.generate(
                    **inputs,
                    **generation_kwargs
                )
            print("Generation completed, decoding output...")
            # Decode the output
            answer = self.tokenizer.decode(output[0], skip_special_tokens=True)
            print(f"Answer now: {answer}")
            # Extract just the answer part (remove the prompt)
            if "Answer:" in answer:
                answer = answer.split("Answer:")[1].strip()
            elif "Please provide a complete answer" in answer:
                answer = answer.split("Please provide a complete answer")[1].strip()
                if answer.startswith("."):
                    answer = answer[1:].strip()
            elif question in answer:
                # If the question is in the answer, extract everything after it
                answer = answer.split(question)[1].strip()
            
            return answer
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"Error generating answer: {str(e)}"
    
 
    def AnswerAny(self, question):
        """
        Answer a question using multiple approaches and return the best result.
        
        Args:
            question: The question to answer
            
        Returns:
            The best answer from available methods
        """
        my_queue1=queue.Queue()
        my_queue2=queue.Queue()
    
        #print(f"Processing question: {question}")
        pipeline1=threading.Thread(target=self.answer_with_bert,args=(question,my_queue1))
        pipeline2=threading.Thread(target=self.query_vector_models,args=(question,my_queue2))
        #pipeline3=threading.Thread(target=self.answer_question,args=(question,result))

        pipeline1.start()
        pipeline2.start()
        #pipeline3.start()
        pipeline1.join()
        pipeline2.join()
        #pipeline3.join()

  
        # Put dictionaries into the queue
        #my_queue.put({"answer": "Alice", "score": 95})
        bert_score=0
        bert_answer=""
        # Print all dictionaries from the queue
        while not my_queue1.empty():
            answer_bertd = my_queue1.get()
            bert_score=answer_bertd["score"]
            bert_answer=answer_bertd["answer"]
            break;

        #print(f"BERT score {bert_score} Answer: {bert_answer}")


        q_score=0
        q_answer=""
        # Print all dictionaries from the queue
        #print("Queue query contents:")
        while not my_queue2.empty():
            answer_q = my_queue2.get()
            q_score=answer_q["score"]
            q_answer=answer_q["answer"]
            #print(f"answer_q")
            break;

        #print(f"Custom score:{q_score} Answer: {q_answer}")
        answer=""
        if q_score >= bert_score:
            answer=q_answer
        elif  bert_score > q_score:  
            answer=bert_answer
        elif q_score==bert_score:
            answer=q_answer
        else:
            answer=""       

        return answer

    def answer_with_bert(self, question: str, my_queue=None) -> str:
        """
        Answer a question using the trained BERT model.

            question: The question to answer
            my_queue: Optional queue to put results into for parallel processing
            
        Returns:
            The model's answer to the question or empty string if no answer found
        """
        if self.bert_model is None or self.bert_tokenizer is None:
            print("BERT model or tokenizer not loaded")
            my_queue.put({"answer": "", "score": 0})
            return ""
        results_text = []
        try:
            import torch
            
            # Find the most similar question in the training data
            data=readModelFile()
            best_match = None
            best_score = 0.6  # Lower threshold for a good match
            finscore=0
            # Normalize the question (lowercase, remove punctuation)
            import re
            normalized_question = re.sub(r'[^\w\s]', '', question.lower())
            words = set(normalized_question.split())
            
            score = 0
            # Find the best matching question in the training data
            for item in data:
                train_question = item["question"].lower()
                normalized_train = re.sub(r'[^\w\s]', '', train_question)
                train_words = set(normalized_train.split())
                
                # Calculate word overlap
                common_words = words.intersection(train_words)
                if len(common_words) > 0:
                    # Score based on percentage of words matched
                    score = len(common_words) / max(len(words), len(train_words))
                    
                    # Boost score for exact matches or near matches
                    if normalized_question == normalized_train:
                        score = 1.0
                    elif normalized_question in normalized_train or normalized_train in normalized_question:
                        score = 0.9
                    
                    if score > best_score:
                        best_score = score
                        best_match = item
                        finscore=score
                        if "answer" in best_match:
                            results_text.append(f"{best_match["answer"]}")
                        elif "answer_text" in best_match:
                            results_text.append(f"{best_match["answer_text"]}")
                        elif "context" in best_match:
                            results_text.append(f"{best_match["context"]}")
            
            # Return the answer if we have a good match
            answer=""
            if best_match:
                # Check for different possible answer field names
                answer = ""
                if "answer" in best_match:
                    answer = best_match["answer"]
                elif "answer_text" in best_match:
                    answer = best_match["answer_text"]
                elif "context" in best_match:
                    answer = best_match["context"]
                #print(f"Answer text {answer}")    
                #print(f"results text {results_text}")
                return self.checkfurther(my_queue,question,results_text,finscore,answer)
            my_queue.put({"answer": "", "score": 0})
            return ""
            
        except Exception as e:
            logger.error(f"Error using BERT model: {str(e)}")
            my_queue.put({"answer": "", "score": 0})
            return ""
    def isYesNo(self,query_text):
        yes_no_prefixes = ["does", "is", "are", "can", "do", "has", "have", "will", "should", "would", "could"]
        is_yes_no_question = False
        
        # Convert to lowercase for case-insensitive matching
        query_lower = query_text.lower().strip()
        isanswerpart=""
        # Check if the question starts with a yes/no prefix
        for prefix in yes_no_prefixes:
            if query_lower.strip().startswith(prefix + " "):
                is_yes_no_question = True
                start_index = query_lower.strip().find(prefix)
                after_substring_start = start_index + len(prefix)
                isanswerpart = query_text.strip()[after_substring_start:]
                if "?" in query_text:
                    qstart_index = query_text.find("?")
                    isanswerpart=isanswerpart[:-qstart_index]
                break
        return is_yes_no_question        
    def query_vector_models(self, query_text: str, my_queue=None, top_k: int = 5) -> str:

        # Initialize sentence transformer if needed
        self._initialize_sentence_transformer()
        
        if not self.vectors:
            my_queue.put({"answer": "", "score": 0})
            return ""
        
        # Check if sentence_transformer is initialized
        if self.sentence_transformer is None:
            print("Warning: Sentence transformer not initialized, cannot process vector query")
            my_queue.put({"answer": "", "score": 0})
            return ""
            
        # Encode the query text
        query_vector = self.sentence_transformer.encode(query_text)
        #print(f"all results: {query_vector}")
        
        # Calculate similarities
        similarities = []
        for path, vector in self.vectors.items():
            similarity = self._cosine_similarity(query_vector, vector)
            similarities.append((path, similarity))
        #print(f"Top similarity: {similarities}")
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_results = similarities[:top_k]
        #print(f"----->Top results: {top_results[0]}")
        # Extract information from top results
        # General query handling
        results_text = []
        # For debugging
        #print(f"\nProcessing query: {query_text}")
        inttscore=0
        for path, score in top_results:
            #print(f"path: {path} score: {score}")
            if score > CONFIDENCE_SCORE:  # Only include high confidence results
                text = self.get_text_from_path(path)
                if text and text != "Unknown text":
                    #print(f"Checking text: {text}  SCORE: {score}")
                    inttscore = score
                    results_text.append(f"{text}")
        #print(f"Matching text: {results_text}")
        
        #print(f"----->Answer text {answer_text}")    
        # Handle yes/no questions differently
        if(len(results_text))>0:
            answer_text=results_text[0]
        else:
            answer_text=""  
        return self.checkfurther(my_queue,query_text,results_text,inttscore,answer_text)
        
    def checkfurther(self,my_queue,query_text,results_text,inttscore,answer_text):
        db_supported = False
        db_version_match=False

        is_yes_no_question=self.isYesNo(query_text)
        if is_yes_no_question:
            question_lower = query_text.lower()
            analyzer = NlpQuestionAnalyzer()
            entities = analyzer.get_named_entities(query_text)
            DATABASE_SYSTEM=""
            VERSION=""
            for entity in entities:
                if(entity['label'] == 'DATABASE_SYSTEM'):
                    DATABASE_SYSTEM=entity['text']
                if(entity['label'] == 'VERSION'):
                    VERSION=entity['text']
            #print(f"Database system: {DATABASE_SYSTEM} VERSION: {VERSION}")
            supkeywords = ["supports", "supported", "compatible", "Support","monitor","work with","work"]
            snormalized_keywords = [word.lower() for word in supkeywords]
            supwpattern = r'\b(?:' + '|'.join(re.escape(word) for word in snormalized_keywords) + r')\b'

            nsupkeywords = ["netowrk", "traffic", "encrypt", "shared","memory","blocking","redact","redaction","exit","uid","chain","ktap","compression","instance discovery","protocol","va","classification",""]
            nsnormalized_keywords = [word.lower() for word in nsupkeywords]
            nsupwpattern = r'\b(?:' + '|'.join(re.escape(word) for word in nsnormalized_keywords) + r')\b'

            base_dbkeyword = DATABASE_SYSTEM
            dbbaseparts = re.findall(r'[A-Za-z]+', base_dbkeyword)
            dbpartpattern = r"\b" + r"\s?".join(dbbaseparts)
            if (re.search(supwpattern, query_text, re.IGNORECASE) or re.search(nsupwpattern, query_text, re.IGNORECASE)):
                important_terms = []
                for term in question_lower.split():
                    if term not in ["does", "is", "are", "the", "a", "an", "?", "."]:
                        important_terms.append(term)
                
                for intText in results_text:
                    answer_text = intText
                    #print(f"Interesting text:{answer_text}")
                    #print(f"Database supported: {dbpartpattern}  {intText}")
                    dbfindregex = re.compile(rf"\b{dbpartpattern}\b", re.IGNORECASE | re.MULTILINE)
                    dbfmatches = dbfindregex.findall(intText)
                    if dbfmatches:
                        db_supported = True
                    #print(f"Is supported .....{db_supported}")   
                    dbpattern = rf"{DATABASE_SYSTEM}\s+{VERSION.replace('.', r'\.')}"
                    #print(dbpattern)
                    dbpatternsepver = rf"{DATABASE_SYSTEM}\s+version\\s+{VERSION.replace('.', r'\.')}" 
                    #print(dbpatternsepver)     
                    dbspacepatterh=rf"{dbpartpattern}\s*{VERSION.replace('.', r'\.')}"
                    #print(dbspacepatterh)
                    dbspacepatterh2= rf"{dbpartpattern}\s+version\\s+{VERSION.replace('.', r'\.')}" 
                    #print(dbspacepatterh2)       
                    #print(f"Database pattern: {dbpattern}    {dbpatternsepver}")
                    versregex="version"
                    #vsupkeywords = ["version", dbpattern,dbpatternsepver,dbspacepatterh,dbspacepatterh2]
                    combined_pattern = rf"(?:{versregex}|{dbpattern}|{dbpatternsepver}|{dbspacepatterh}|{dbspacepatterh2})"
                    #vsnormalized_keywords = [word for word in vsupkeywords]
                    vsmatches = re.findall(combined_pattern, query_text, re.IGNORECASE|re.MULTILINE)
                    #print(f"Version {combined_pattern} matches: {vsmatches}")
                    #vsupwpattern = r'\b(?:' + '|'.join(re.escape(word) for word in vsnormalized_keywords) + r')\b'
                    if db_supported and len(vsmatches) > 0:
                        #print("Database is supported checking versions .....")
                        combined_pattern = rf"(?:{dbpattern}|{dbpatternsepver}|{dbspacepatterh}|{dbspacepatterh2})"
                        vsmatches = re.findall(combined_pattern, intText, re.IGNORECASE|re.MULTILINE)
                        #print(f"Version matches: {vsmatches}")
                        if len(vsmatches) > 0:
                            db_version_match=True
                            lines_list = answer_text.splitlines()
                            result = f"Yes, it is. {answer_text}" if len(lines_list)<50 else "Yes, it is."
                            my_queue.put({"answer": result, "score": inttscore})
                            #print(f"Final Version matches: {result}")
                            return result
                    elif db_supported:
                        lines_list = answer_text.splitlines()
                        result = f"Yes, it is.{answer_text}" if len(lines_list)<50 else "Yes, it is."
                        my_queue.put({"answer": result, "score": inttscore})
                        return result
                    else:
                        result = ""
                        my_queue.put({"answer": result, "score": 0})
                        return result
            else:
                if answer_text:
                    result = f"{answer_text}."
                    my_queue.put({"answer": result, "score": inttscore})
                else:
                    result = ""
                    my_queue.put({"answer": result, "score": 0})
                return result
        else:
            result = f"{answer_text}."
            my_queue.put({"answer": result, "score": inttscore})
            return result
        
        # Default fallback
        result = ""
        my_queue.put({"answer": result, "score": 0})
        return result
        
    def get_text_from_path(self, path: str) -> str:
        """
        Get the original text from a path returned by a query.
        
        Args:
            path: The path in format "model_name:path"
            
        Returns:
            The original text
        """
        if ':' not in path:
            return "Invalid path format"
            
        model_name, original_path = path.split(':', 1)
        
        if model_name not in self.vector_models:
            return "Unknown model"
            
        vector = self.vectors.get(path)
        if vector is None:
            return "Unknown path"
            
        return self.vector_to_text(model_name, vector)
    
    def vector_to_text(self, model_name: str, vector: np.ndarray) -> str:
        """
        Convert a vector back to its original text.
        
        Args:
            model_name: Name of the model the vector belongs to
            vector: The vector to convert
            
        Returns:
            The original text
        """
        if model_name not in self.vector_models:
            return "Unknown model"
            
        vector_key = str(vector.tobytes())
        full_key = f"{model_name}:{vector_key}"
        return self.vector_to_text_map.get(full_key, "Unknown text")
    
    def _anotherApproachcosine_similarity(self, vec1, vec2) -> float:
        dot_product = sum(a*b for a, b in zip(vec1, vec2))
        magnitude_A = sum(a*a for a in vec1)**0.5
        magnitude_B = sum(b*b for b in vec2)**0.5
        cosine_similarity = dot_product / (magnitude_A * magnitude_B)
        return cosine_similarity
    def _cosine_similarity(self, vec1, vec2) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First vector (numpy array or tensor)
            vec2: Second vector (numpy array or tensor)
            
        Returns:
            Cosine similarity score
        """
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
    
    def get_custom_model_context(self, question: str) -> str:
        """
        Get relevant context from custom models based on the question.
        
        Args:
            question: The question to find context for
            
        Returns:
            String containing relevant context from custom models
        """
        if not self.custom_models:
            return ""
        
        # Convert question to lowercase for case-insensitive matching
        question_lower = question.lower()
        
        # For other questions, use more selective matching
        relevant_docs = []
        
        # Search through all custom models
        for model_name, model_data in self.custom_models.items():
            #print(f"Searching for context in model: {model_name})")
            if "documents" not in model_data:
                continue
            #print(f"2--->Searching for context in model: {model_name})")
            for doc in model_data["documents"]:
                # For JSON documents, convert to string for searching
                if doc.get("type") == "json":
                    content = json.dumps(doc.get("content", {}), indent=2)
                else:
                    content = doc.get("content", "")
                
                # Extract keywords from the question (excluding common words)
                common_words = ["what", "is", "the", "a", "an", "in", "on", "at", "to", "for", "with", "about", "today"]
                keywords = [word for word in question_lower.split() if word not in common_words]
                
                # If no meaningful keywords remain, return empty string
                if not keywords:
                    return ""
                
                doc_name = doc.get('name', '').lower()
                
                # More selective matching - require at least 2 keyword matches or a very specific match
                matches = sum(1 for keyword in keywords if keyword in content.lower() or keyword in doc_name)
                if matches >= 2 or any(keyword in doc_name for keyword in keywords):
                    relevant_docs.append({
                        "content": content,
                        "source": f"{model_name}/{doc.get('name', 'unknown')}"
                    })
        
        # Combine relevant documents into context
        if relevant_docs:
            context = "\n\n".join([f"Document from {doc['source']}:\n{doc['content']}" for doc in relevant_docs])
            return context
        
        return ""
    
    def answer_with_sources(self, question: str, documents: List[Dict[str, str]],
                           max_length: int = 4096, max_new_tokens: int = 1024, temperature: float = 0.1) -> Dict[str, Any]:
        """
        Answer a question using the Granite model with source documents.
        
        Args:
            question: The question to answer
            documents: List of documents to use as context
                       Each document should be a dict with 'content' and 'source' keys
            max_length: Maximum length of the generated answer (including prompt)
            max_new_tokens: Maximum number of new tokens to generate
            temperature: Temperature for sampling
            
        Returns:
            Dict containing the answer and source information
        """
       
        # Fall back to Granite model with documents
        if not documents:
            # Try to get an answer without documents
            try:
                return {"answer": self.answer_question(question, max_length=max_length, max_new_tokens=max_new_tokens, temperature=temperature),
                        "sources": []}
            except RuntimeError:
                # If Granite model is not available, try vector models again with a more general search
                vector_answer = self.query_vector_models(question)
                if vector_answer:
                    return {"answer": vector_answer, "sources": ["Vector model search results"]}
                return {"answer": "I don't have enough information to answer this question.", "sources": []}
        
        # Combine document contents for context
        context = "\n\n".join([f"Document from {doc.get('source', 'unknown')}:\n{doc.get('content', '')}"
                               for doc in documents])
        
        # Add context from custom models if available
        custom_context = self.get_custom_model_context(question)
        if custom_context:
            if context:
                context = f"{context}\n\n{custom_context}"
            else:
                context = custom_context
        
        # Get answer with context
        try:
            answer = self.answer_question(question, context, max_length, max_new_tokens, temperature)
        except RuntimeError:
            # If Granite model is not available, try vector models again
            vector_answer = self.query_vector_models(question)
            if vector_answer:
                return {"answer": vector_answer, "sources": ["Vector model search results"]}
            return {"answer": "I don't have enough information to answer this question.", "sources": []}
        
        # Return answer with sources
        return {
            "answer": answer,
            "sources": [doc.get('source', 'unknown') for doc in documents]
        }
    
    def _get_stopping_criteria(self):
        """
        Create stopping criteria to prevent hanging during generation.
        """
        # Instead of using custom stopping criteria, we'll use generation parameters
        # to limit the generation time and length
        return None
    
    @staticmethod
    def download_model(model_name: str = "granite-4.0-micro",
                       output_dir: str = "/ibm-granite") -> str:
        """
        Download the IBM Granite model.
        
        Args:
            model_name: Name of the model to download
            output_dir: Directory to save the model
            
        Returns:
            Path to the downloaded model
            
        Raises:
            RuntimeError: If the download fails
        """
        try:
            from huggingface_hub import snapshot_download
            
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Full model name on Hugging Face
            full_model_name = f"ibm/{model_name}"
            
            logger.info(f"Downloading model {full_model_name} to {output_dir}...")
            
            # Download the model
            model_path = snapshot_download(
                repo_id=full_model_name,
                local_dir=os.path.join(output_dir, model_name),
                local_dir_use_symlinks=False
            )
            
            logger.info(f"Model downloaded successfully to {model_path}")
            return model_path
            
        except ImportError:
            logger.error("huggingface_hub not installed")
            logger.info("Please install with: pip install huggingface_hub")
            raise
        except Exception as e:
            logger.error(f"Error downloading model: {str(e)}")
            raise RuntimeError(f"Failed to download model: {str(e)}")

if __name__ == "__main__":
    mr= ModelReader()
    
    # Test regular query
    print("\n--- Testing regular query ---")
    res=mr.query_vector_models("List the databases that support STAP")
    print(f"Here is the result \n {res}")
    # Test yes/no question with supported version
    print("\n--- Testing yes/no question with supported version ---")
    yes_no_res = mr.query_vector_models("Does Guardium supports Informix 12.1 version?")
    print(f"Question: Does Guardium supports Informix 12.1 version?")
    print(f"Answer: {yes_no_res}")
    
    # Test yes/no question with unsupported version
    print("\n--- Testing yes/no question with unsupported version ---")
    yes_no_res_unsupported = mr.query_vector_models("Does Guardium supports Informix 12.5 version?")
    print(f"Question: Does Guardium supports Informix 12.5 version?")
    print(f"Answer: {yes_no_res_unsupported}")
    

    res=mr.query_vector_models("List the databases that support STAP")
    print(f"Here is the result \n {res}")
    # Test yes/no question with supported version
    print("\n--- Testing yes/no question with supported version ---")
    yes_no_res = mr.query_vector_models("Does Guardium supports Informix 12.1 version?")
    print(f"Question: Does Guardium supports Informix 12.1 version?")
    print(f"Answer: {yes_no_res}")
    
    # Test yes/no question with unsupported version
    print("\n--- Testing yes/no question with unsupported version ---")
    yes_no_res_unsupported = mr.query_vector_models("Does Guardium supports Informix 12.5 version?")
    print(f"Question: Does Guardium supports Informix 12.5 version?")
    print(f"Answer: {yes_no_res_unsupported}")
    
