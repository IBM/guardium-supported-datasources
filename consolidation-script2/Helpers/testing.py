from .csv_helpers import read_csv_file_dict_reader

def _test(output_csv_path, input_csv_path, header_key, feature_key, logger):
    # Open input_csv_path using Dict Reader
    input_data = read_csv_file_dict_reader(input_csv_path)
    compressed_data = read_csv_file_dict_reader(output_csv_path)
    
    logger.debug("Starting Test for %s", output_csv_path)

    for input_row in input_data:
        matched = 0
        for compressed_row in compressed_data:
            # Check if header_key values match
            if header_values_match(input_row,compressed_row,header_key):   
                # if yes, then check if feature_key values also match
                if feature_values_match(input_row,compressed_row,feature_key):
                    matched +=1

        assert matched == 1
    
    logger.info("PASSED test for %s",output_csv_path)
        

def header_values_match(input_row,compressed_row,header_key):
    """
    Check if the values for the specified headers match
    between the input row and the compressed row.

    Args:
        input_row (dict): The original row of data.
        compressed_row (dict): The compressed row of data with values as comma-separated strings.
        header_key (list): List of header keys to check for matching values.

    Returns:
        bool: True if all header values match, False otherwise.
    """
    for header in header_key:
        split_lst = compressed_row[header].split(',')
        cleaned_lst = [item.replace("'", "").replace('"', "")
                       .replace("(","").replace(")","").strip() for item in split_lst]

        cleaned_input_row_header = input_row[header].replace("'", "").replace('"', "").replace("(","").replace(")","").strip()

        if not any(cleaned_input_row_header == item for item in cleaned_lst):
            return False

    return True

def feature_values_match(input_row,compressed_row, feature_key):
    """
    Check if the values for the specified features match 
    between the input row and the compressed row.

    Args:
        input_row (dict): The original row of data.
        compressed_row (dict): The compressed row of data with values as strings.
        feature_key (list): List of feature keys to check for matching values.

    Returns:
        bool: True if all feature values match, False otherwise.
    """
    for feature in feature_key:
        if not input_row[feature].strip() == compressed_row[feature].strip():
            return False
    return True