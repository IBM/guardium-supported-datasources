#!/usr/bin/env python3
"""
TrainQuans.py - Train a question answering model using the QATrain.txt dataset.

This script loads the QATrain.txt file, processes it into a format suitable for
training a question answering model, and then trains a BERT-based model for
extractive question answering.
"""

import json
import time
import os
import torch
import logging
import warnings
from transformers import (
    AutoTokenizer,
    AutoModelForQuestionAnswering,
    Trainer,
    TrainingArguments,
    logging as transformers_logging
)
from datasets import Dataset
from config import CUSTOM_MODEL, TRAIN_FILE

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress specific transformers warnings
transformers_logging.set_verbosity_error()
warnings.filterwarnings("ignore", message="Some weights of .* were not initialized from the model checkpoint .*")

def load_data_from_file(file_path=None):
    """
    Load and process data from QATrain.txt file.
    
    Args:
        file_path (str, optional): Path to the training data file.
            If None, uses the path from config.
            
    Returns:
        list: Processed data ready for model training
    """
    if file_path is None:
        file_path = TRAIN_FILE
        
    print(f"Loading data from {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except Exception as e:
        print(f"Error loading data file: {e}")
        return []
    
    # Transform data into the format expected by the model
    processed_data = []
    for article in data:
        context = article["context"]
        
        for qa in article["qas"]:
            processed_item = {
                "id": f"{article.get('id', 'unknown')}_{len(processed_data)}",
                "question": qa["question"],
                "context": context,
                "answer_text": qa["answer"]["text"],
                "answer_start": qa["answer"]["answer_start"]
            }
            processed_data.append(processed_item)
    
    logger.info(f"Loaded {len(processed_data)} QA pairs from {file_path}")
    return processed_data

def preprocess_data(examples, tokenizer):
    """
    Preprocess data for training.
    
    Args:
        examples: Dataset examples to preprocess
        tokenizer: Tokenizer to use for preprocessing
        
    Returns:
        dict: Preprocessed features
    """
    # Tokenize questions and contexts
    inputs = tokenizer(
        examples["question"],
        examples["context"],
        truncation="only_second",  # Truncate only the context if needed
        max_length=512,
        stride=128,               # Use stride for long contexts
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
        padding="max_length",
    )
    
    # Map offsets to answer positions
    offset_mapping = inputs.pop("offset_mapping")
    sample_map = inputs.pop("overflow_to_sample_mapping")
    start_positions = []
    end_positions = []
    
    for i, offsets in enumerate(offset_mapping):
        # Get the index of the sample this sequence belongs to
        sample_idx = sample_map[i]
        
        # Get answer start and end character positions
        answer_start = examples["answer_start"][sample_idx]
        answer_end = answer_start + len(examples["answer_text"][sample_idx])
        
        # Find token indices that contain the answer
        sequence_ids = inputs.sequence_ids(i)
        
        # Find the start and end of the context
        context_start = 0
        while sequence_ids[context_start] != 1:
            context_start += 1
        context_end = len(sequence_ids) - 1
        while sequence_ids[context_end] != 1:
            context_end -= 1
            
        # If the answer is not fully inside the context, label is (0, 0)
        if (offsets[context_start][0] > answer_start or
                offsets[context_end][1] < answer_end):
            start_positions.append(0)
            end_positions.append(0)
        else:
            # Otherwise, find the tokens that contain the answer
            token_start = context_start
            while token_start <= context_end and offsets[token_start][0] <= answer_start:
                token_start += 1
            token_start -= 1
            
            token_end = context_end
            while token_end >= context_start and offsets[token_end][1] >= answer_end:
                token_end -= 1
            token_end += 1
            
            start_positions.append(token_start)
            end_positions.append(token_end)
    
    inputs["start_positions"] = start_positions
    inputs["end_positions"] = end_positions
    return inputs

def main():
    """Main training function."""
    logger.info("Starting question answering model training...")
    logger.info("Note: Initialization warnings are normal when adapting a pre-trained model for QA")
    logger.info("The 'qa_outputs' layer is specifically added for question answering tasks")
    
    # Load tokenizer and model
    model_name = "bert-base-uncased"
    logger.info(f"Loading base model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForQuestionAnswering.from_pretrained(model_name)
    
    # Load and process data
    processed_data = load_data_from_file()
    if not processed_data:
        logger.error("No data loaded. Exiting.")
        return
    
    # Convert to Hugging Face Dataset
    dataset = Dataset.from_list(processed_data)
    logger.info(f"Created dataset with {len(dataset)} examples")
    
    # Define preprocessing function with tokenizer
    def preprocess_function(examples):
        return preprocess_data(examples, tokenizer)
    
    # Process the dataset
    processed_dataset = dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    logger.info(f"Processed dataset with {len(processed_dataset)} examples")
    
    # Split dataset into training and validation sets
    train_test_split = processed_dataset.train_test_split(test_size=0.2, seed=42)
    train_dataset = train_test_split["train"]
    val_dataset = train_test_split["test"]
    logger.info(f"Split into {len(train_dataset)} training and {len(val_dataset)} validation examples")
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join("tests", "output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Training arguments - simplified to avoid parameter compatibility issues
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        warmup_ratio=0.1,
        weight_decay=0.01,
        logging_dir=output_dir,
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        # Remove problematic parameters that might not be compatible with this version
        # Don't use load_best_model_at_end since it requires matching strategies
    )
    
    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
    )
    
    # Train the model
    logger.info("Starting training...")
    start_time = time.time()
    trainer.train()
    
    # Save the fine-tuned model
    logger.info(f"Saving model to {CUSTOM_MODEL}")
    model.save_pretrained(CUSTOM_MODEL)
    tokenizer.save_pretrained(CUSTOM_MODEL)
    
    end_time = time.time()
    logger.info(f"Training completed in {end_time - start_time:.2f} seconds")
    logger.info(f"Model and tokenizer saved to {CUSTOM_MODEL}")

if __name__ == "__main__":
    main()

# Made with Bob
