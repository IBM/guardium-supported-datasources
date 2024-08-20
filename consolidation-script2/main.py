from runner import consolidate
import argparse
import yaml
import os

# Define command-line arguments
parser = argparse.ArgumentParser(description='Load and use YAML configuration file.')
parser.add_argument('config_file', type=str, help='Path to the YAML configuration file')

# Parse command-line arguments
args = parser.parse_args()

path_to_csv = f"{os.getcwd()}/{args.config_file}"
# Load the YAML configuration file based on the provided path
with open(path_to_csv, 'r',encoding='utf-8') as config_file:
    
    config = yaml.safe_load(config_file)



print(config)
OUTPUT_JSON_PATH=f"{os.getcwd()}/{config['output_json_path']}"
OUTPUT_CSV_PATH= f"{os.getcwd()}/{config['output_csv_path']}"
FULL_CSV_PATH= f"{os.getcwd()}/{config['full_csv_path']}"
COMPAT_HEADERS = config['compat_header']
FEATURE_HEADERS = config['feature_header']
PARTITION_HEADER = config["partition_header"]

FULL_KEY = COMPAT_HEADERS + FEATURE_HEADERS

#  #TODO: Generalize this, 
# # TODO: Add a partition parameter


consolidate(OUTPUT_JSON_PATH,OUTPUT_CSV_PATH, FULL_CSV_PATH, COMPAT_HEADERS, FULL_KEY, PARTITION_HEADER)
