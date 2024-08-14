""" Just a collection of helper function related to csv read/write actions
"""
import csv
from typing import List
import logging

def read_csv_file(file_path) -> List[List[str]]:
    """ Reads CSV file given path"""
    data = []
    with open(file_path, 'r', encoding="utf-8-sig", newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            data.append(row)
    return data

def read_csv_file_dict_reader(file_path):
    """ Reads CSV file given path using dict reader"""
    data = []
    with open(file_path, 'r', encoding="utf-8-sig", newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def read_csv_for_uniq_val(file_path:str,db_name:str,header_number:int) -> List[List[str]]:
    """ Reads CSV file given path, 
    will only return rows with a certain value (db_name) in a certain column 
    
     Args:
        file_path (str): Path to the CSV file.
        db_name (str): The value to match in the specified column.
        header_number (int): The index of the column to check for matching values.

    Returns:
        List[List[str]]: A list of rows that match the specified value in the given column.
    """
    try:
        data = []
        with open(file_path,encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            # Iterate through each row
            for row in reader:
                if row[header_number].strip() == db_name:
                    data.append(row)
        return data
    except FileNotFoundError:
        logging.error("CSV file not found: %s", file_path)
        raise
    except Exception as e:
        logging.error("Error reading CSV file %s: %s", file_path, e)
        raise

def read_csv_get_unique_vals_in_column(file_path:str,header_number:int) -> List[str]:
    """ 
    Gets all unique values from a certain column from csv file excluding the header
    
    Args:
        file_path (str): The path to the CSV file.
        header_number (int): The index of the column from which to extract unique values.

    Returns:
        List[str]: A list of unique values from the specified column.
    """
    try:
        uniq_vals = set()
        with open(file_path,encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            next(reader)  #Skip the header
            # Iterate through each row
            for row in reader:
                if row[header_number].strip() not in uniq_vals:
                    uniq_vals.add(row[header_number].strip())
        return list(uniq_vals)
    except FileNotFoundError:
        logging.error("CSV file not found: %s", file_path)
        raise
    except Exception as e:
        logging.error("Error reading CSV file %s: %s", file_path, e)
        raise


def write_csv_to_file(file_path:str,data:List[List[str]]):
    """ Writes a 2D List into CSV file given path """
    # Open the CSV file in write mode
    with open(file_path, mode='w',encoding="utf-8-sig", newline='') as file:
        # Create a CSV writer
        writer = csv.writer(file)

        # Write the 2D list to the CSV file
        writer.writerows(data)

def transform_and_append_as_csv(full_key, output_csv, feature_list, xss):
    """
    Appends data as CSV rows to the provided output list.

    Args:
        full_key (list): A list of all column headers/keys for the CSV.
        output_csv (list): A list that accumulates the CSV rows.
        feature_list (list): A list of additional features to append to each row.
        xss (list of lists): A list of lists,
        where each inner list represents a partial row of data.

    Each row from `xss` is converted to a string, square brackets are replaced with parentheses, 
    and the result is concatenated with the feature_list. The concatenated row is then appended 
    to the output_csv.
    """
    for xs in xss:
        xs_str = [f"{str(x).replace('[','(').replace(']',')')}" for x in xs]
        full_line = xs_str + feature_list
        assert(len(full_line) == len(full_key))

        output_csv.append(full_line)

def transform_and_append_as_json(full_key, output_json, uniq_val, feature_list, xss):
    """
    Appends data as JSON objects to the provided output dictionary.

    Args:
        full_key (list): A list of all keys for the JSON objects.
        output_json (dict): A dictionary that accumulates JSON objects. 
                            Each key (uniq_val) points to a list of JSON objects.
        uniq_val: A unique value that serves as the key in the output_json dictionary.
        feature_list (list): A list of additional features to append to each JSON object.
        xss (list of lists): A list of lists,
        where each inner list represents a set of data to be converted into a JSON object.

    Each row from `xss` is concatenated with the feature_list,
    and the result is converted into a JSON object with keys from `full_key`.
    The JSON object is then appended to the list in output_json corresponding to uniq_val.
    """
    for xs in xss:
        full_line = xs + feature_list
        assert(len(full_line) == len(full_key))

        xss_json = {}
        for i,val in enumerate(full_key):
            xss_json[val] = full_line[i]
        output_json[uniq_val].append(xss_json)
