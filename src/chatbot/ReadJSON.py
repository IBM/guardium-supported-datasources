from typing import Any


import json
import os
from config import CUSTOM_MODEL,TRAIN_FILE
def traverse_json(node, indent=0):
    """
    Recursively traverses a JSON node (dictionary or list) and prints its contents.
    """
    if isinstance(node, dict):
        for key, value in node.items():
            print(f"{'  ' * indent}Key: {key}")
            if isinstance(value, (dict, list)):
                print(f"{'  ' * indent}Value (nested):")
                traverse_json(value, indent + 1)
            else:
                print(f"{'  ' * indent}Value: {value}")
    elif isinstance(node, list):
        for i, item in enumerate(node):
            print(f"{'  ' * indent}Item {i}:")
            if isinstance(item, (dict, list)):
                traverse_json(item, indent + 1)
            else:
                print(f"{'  ' * indent}Value: {item}")
    else:
        print(f"{'  ' * indent}Value: {node}")
def flatten_json_recursive(data, parent_key='', sep='_'):
    """
    Flattens a nested dictionary into a single-level dictionary.
    
    Args:
        data (dict): The dictionary to flatten.
        parent_key (str): The base key for recursion.
        sep (str): The separator for concatenated keys.
        
    Returns:
        A flattened dictionary.
    """
    items = {}
    for key, value in data.items():
        new_key = f"{parent_key}{sep}{key}" if parent_key else key
        
        if isinstance(value, dict):
            items.update(flatten_json_recursive(value, new_key, sep=sep))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                # Handle lists of dictionaries
                if isinstance(item, dict):
                    items.update(flatten_json_recursive(item, f"{new_key}{sep}{i}", sep=sep))
                else:
                    # Handle lists of other types
                    items[f"{new_key}{sep}{i}"] = item
        else:
            items[new_key] = value
            
    return items

def read_json_file(file_path) -> dict:
    """
    Read and parse a JSON file.
    
    Args:
        file_path (str): Path to the JSON file
        
    Returns:
        dict: Parsed JSON data
    """
    try:
        # Use utf-8-sig encoding to handle UTF-8 BOM
        with open(file_path, 'r', encoding='utf-8-sig') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return {}
def readModelFile():
    """
    Read and process the QATrain.txt file into a format suitable for model training.
    
    Returns:
        list: Processed data ready for model training
    """
    train_file_path = TRAIN_FILE
    data = read_json_file(train_file_path)

    # Transform data into the format expected by the model
    processed_data = []
    for article in data:
        context = article["context"]
        
        for qa in article["qas"]:
            processed_item = {
                "question": qa["question"],
                "context": context,
                "answer_text": qa["answer"]["text"],
                "answer_start": qa["answer"]["answer_start"]
            }
            processed_data.append(processed_item)
    
    #print(f"Loaded {len(processed_data)} QA pairs from {train_file_path}")
    return processed_data
def save_to_file(data, output_path):
    """
    Save processed data to a JSON file.
    
    Args:
        data (dict): The processed data
        output_path (str): Path to save the output file
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2)
        print(f"Data successfully saved to {output_path}")
    except Exception as e:
        print(f"Error saving data to file: {e}")
def main():
    # Define file paths
    input_file = "/Users/vinu/Documents/Data/Security/CustomerFocus/Guardium/guardium-supported-datasources/src/data/consolidated_jsons/OnPrem_Stap.json"
   
    # Read the JSON file
    data = read_json_file(input_file)
    if not data:
        print("Failed to read input file.")
        return
    res=flatten_json_recursive(data=data)
    print(res)
    save_to_file(res,"output/OnPrem_Stap.json")


if __name__ == "__main__":
    main()