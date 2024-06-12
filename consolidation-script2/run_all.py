from main import consolidate
import argparse
import yaml
import os

# Define command-line arguments
parser = argparse.ArgumentParser(description='Directory path load and use YAML configuration files.')
parser.add_argument('config_dir', type=str, help='Path to the YAML configuration directory')

# Parse command-line arguments (get path to config directory)
args = parser.parse_args()
path_to_dir = os.path.join(os.getcwd(),args.config_dir)

for file_name in os.listdir(path_to_dir):

    path_to_csv = os.path.join(path_to_dir,file_name)
    
    # Load the YAML configuration file based on the provided path
    with open(path_to_csv, 'r',encoding='utf-8-sig') as config_file:
        config = yaml.safe_load(config_file)

    # Construct variables from config file
    print(f"Printing Config File:{config} \n")
    OUTPUT_JSON_PATH=f"{os.getcwd()}/{config['output_json_path']}"
    OUTPUT_CSV_PATH= f"{os.getcwd()}/{config['output_csv_path']}"
    FULL_CSV_PATH= f"{os.getcwd()}/{config['full_csv_path']}"
    VERSION_HEADERS = config['compat_header']
    FEATURE_HEADERS = config['feature_header']
    PARTITION_HEADER = config["partition_header"]

    FULL_KEY = VERSION_HEADERS + FEATURE_HEADERS

    consolidate(OUTPUT_JSON_PATH,OUTPUT_CSV_PATH, FULL_CSV_PATH, VERSION_HEADERS, FULL_KEY, PARTITION_HEADER, FEATURE_HEADERS)