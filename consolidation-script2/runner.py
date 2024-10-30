"""
Entry point to script
Expects a command line argument string representing path to directory containing config files
"""

import argparse
import os
import sys

import yaml

from main import consolidate, append_to_summary_json
from Helpers.logging_helpers import setup_logger
from Helpers.helpers import write_dict_to_json_file
from Helpers.csv_helpers import validate_csv_headers, get_unique_guardium_versions

# Set up logging
logger = setup_logger(__name__)

def load_config(file_path):
    """Load the YAML configuration file."""
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as config_file:
            config = yaml.safe_load(config_file)
        logger.info("Configuration file (%s) loaded successfully.",file_path)
        return config
    except FileNotFoundError:
        logger.error("Configuration file not found: %s\n\n",file_path)
        sys.exit(1)
    except yaml.YAMLError as e:
        logger.error("Error parsing YAML file : %s\n\n",e)
        sys.exit(1)

def validate_config(config):
    """Validate the loaded configuration to ensure all required fields are present."""
    required_keys = ['output_json_path', 'output_csv_path'
                     , 'input_csv_path', 'compat_header', 'feature_header'
                     , 'partition_header', 'environment_name', 'method_name']
    for key in required_keys:
        if key not in config:
            logger.error("Missing required configuration key: %s\n\n",key)
            sys.exit(1)
    logger.info("Configuration validation passed.")

def main():
    """
    Entry Point Function when calling runner.py
    Expects a command line argument string representing path to directory containing config files
    """

    # Define command-line arguments
    parser = argparse.ArgumentParser(description
                                     ='Directory path load and use YAML configuration files.')
    parser.add_argument('config_dir', type=str, help='Path to the YAML configuration directory')

    # Parse command-line arguments (get path to config directory)
    args = parser.parse_args()
    path_to_dir = os.path.join(os.getcwd(),args.config_dir)

    summary_data = {
    "supported_databases": []
    }


    for file_name in os.listdir(path_to_dir):

        # Construct the full path to the configuration file
        config_path = os.path.join(path_to_dir,file_name)

        # Load and validate the configuration
        config = load_config(config_path)
        validate_config(config)

        # Construct paths
        output_json_path = os.path.join(os.getcwd(), config['output_json_path'])
        output_csv_path = os.path.join(os.getcwd(), config['output_csv_path'])
        input_csv_path = os.path.join(os.getcwd(), config['input_csv_path'])
        version_headers = config['compat_header']
        feature_headers = config['feature_header']
        partition_header = config["partition_header"]
        environment_name = config["environment_name"]
        method_name = config["method_name"]

        # Define the full key
        full_key = version_headers + feature_headers

        # Validate input csv file
        assert validate_csv_headers(input_csv_path,full_key)

        logger.critical("Starting Consolidation for %s",input_csv_path)
        # Call the consolidate function

        consolidate(output_json_path, output_csv_path, input_csv_path,
                    version_headers, full_key, feature_headers,partition_header,
                    logger)
        append_to_summary_json(input_csv_path, environment_name,
                                    method_name, partition_header,summary_data)

        logger.info("Consolidation completed successfully for %s",input_csv_path)
        logger.info("Consolidate CSV file saved to %s", output_csv_path)
        logger.info("Consolidate JSON file saved to %s\n\n",output_json_path)


    write_dict_to_json_file("src/data/summary.json",summary_data)
    get_unique_guardium_versions("consolidation-script2/data/output/csv") # Get guardium versions dynamically
    logger.info("SCRIPT COMPLETED.")

if __name__ == "__main__":
    main()
