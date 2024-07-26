from Helpers.helpers import find_ranges,get_uniq_vals_for_each_column,combinations,subtract_lists
from Helpers.combination import Combination
from typing import List
from Helpers.helpers import group_data_by_feature,remove_duplicates_2d,write_dict_to_json_file
from Helpers.csv_helpers import read_csv_for_uniq_val,read_csv_get_unique_vals_in_column,write_csv_to_file,append_as_csv,append_as_json,read_csv_file_dict_reader
import re

#TODO: MAJOR Cleanup
# example data
example = [
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'Ubuntu', 'Ubuntu 21.04', "Feature A"],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7', "Feature A"],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8', "Feature A"],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8', "Feature A"],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'Windows', 'Windows 10', "Feature A"],
    ['11.0','Cassandra', 'Cassandra 4.0', 'Windows', 'Windows 10', "Feature A"],
    ["11.1",'DB2', 'DB2 11.5.7', 'SUSE', '15', "Feature A"],
    ['11.1','MariaDB', 'MariaDB 10.5', 'macOS', 'macOS 11.0', "Feature A"],
    ['11.1','MariaDB', 'MariaDB 10.6', 'Ubuntu', 'Ubuntu 22.04', "Feature A"],
    ['11.1','MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 8', "Feature A"],
    ['11.1','MongoDB', 'MongoDB 4.2', 'CentOS', 'CentOS 6', "Feature A"],
    ['11.2','MongoDB', 'MongoDB 4.2', 'Windows', 'Windows 10', "Feature A"],
    ['11.2','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7', "Feature A"],
    ['11.3','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7', "Feature A"],
    ["11.3",'MongoDB', 'MongoDB 4.6', 'CentOS', 'CentOS 8', "Feature A"],
    ["11.3",'Redis', 'Redis 7.2', 'Debian', 'Debian 11', "Feature A"],
]


def consolidate(output_json_path,output_csv_path, input_csv_path, header_key, full_key, feature_key,partition_header_number):
    """
    Consolidate and compress data from a CSV file,
        outputting the results to both a JSON and a CSV file.

    This function partitions the data based on unique values in a specified column,
    groups rows based on their feature values, 
    and consolidates rows that have the same features.
    
    The consolidated data is then saved in JSON and CSV formats.

    Args:
        output_json_path (str): The file path where the output JSON will be saved.
        output_csv_path (str): The file path where the output CSV will be saved.
        input_csv_path (str): The file path of the input CSV containing the full data.
        header_key (list): List of header keys to identify unique groups in the data.
        full_key (list): List of all keys/headers in the CSV.
        partition_header_number (int): The column index used for partitioning the data.
        feature_key (list): List of feature keys to match values against.

    Example:
        >>> consolidate('output.json', 'output.csv', 'data.csv', ['id', 'name'],
                                ['id', 'name', 'feature1', 'feature2'], 2, ['feature1', 'feature2'])
    
    Note:
        - 'feature values' refer to cell values indicating the presence of a certain feature.
        - 'version values' refer to cell values indicating versions of OS, Database, or Guardium.
    """

    #Instantiate output variables
    output_csv = []
    output_csv.append(full_key)
    output_json = {}

    # Get unique values in a column (eg. unique database names in database column)
    # (This will be used to partition the tabular data
    # before compression for efficiency)
    uniq_vals = read_csv_get_unique_vals_in_column(input_csv_path,partition_header_number)

    # Loop thru each uniq value
    for uniq_val in uniq_vals:
        output_json[uniq_val] = []

        # Partition data (Get subsection of data relating to current uniq_val)
        data = read_csv_for_uniq_val(input_csv_path,uniq_val,partition_header_number)

        # Note:
            # - 'feature values' refers to cell values that refer to availability of a certain feature
            # - 'version values' refer to cell values that refer to orderable versions of OS,Database, or Guardium
        # Group rows of data based on their feature values
        # The 'get_features' function combines the feature values of each row into a single string, acting as a unique identifier for a grouping
        # The 'get_versions' function extracts the version values from each row to store version information within the group
        grouped_data = group_data_by_feature(data
                                             ,get_features=lambda x: "|+|".join(x[len(header_key):]) # Combine feature values into a unique string identifier
                                             ,get_versions=lambda x:x[0:len(header_key)]) # Extract header key values

        # Loop thru grouped_data dictionary such that each key represents a set of a features
        # Each value of grouped_data dictionary is a list of versions values
        for data_key,_ in grouped_data.items():
            feature_list = data_key.split('|+|') # Convert back into list
            assert(len(feature_list) == (len(full_key)-len(header_key)))

            # Consolidate rows of data that have same feature
            xss = consolidate_per_feature(grouped_data[data_key],header_key)

            # Append consolidated information as json and csv
            append_as_json(full_key, output_json, uniq_val, feature_list, xss)
            append_as_csv(full_key, output_csv, feature_list, xss)


    write_csv_to_file(output_csv_path,output_csv)
    write_dict_to_json_file(output_json_path,output_json)

    _test(output_csv_path, input_csv_path, header_key, feature_key)


def _test(output_csv_path, input_csv_path, header_key, feature_key):
    # Open input_csv_path using Dict Reader
    input_data = read_csv_file_dict_reader(input_csv_path)
    compressed_data = read_csv_file_dict_reader(output_csv_path)

    for input_row in input_data:
        matched = 0
        for compressed_row in compressed_data:
            # Check if header_key values match
            if header_values_match(input_row,compressed_row,header_key):   
                # if yes, then check if feature_key values also match
                if feature_values_match(input_row,compressed_row,feature_key):
                    matched +=1

        assert matched == 1


def pretty_print_row(row):
    """
        Pretty print the key-value pairs of a dictionary row.

        Args:
            row (dict): A dictionary containing key-value pairs to be printed.

        Example:
            >>> pretty_print_row({'name': 'John', 'age': 30})
            name: John
            age: 30
        """
    for key in row.keys():
        print(f"{key}:{row[key]}")
    print("\n")

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


def consolidate_per_feature(compat_data:List[List[str]],key_:List[str]) -> List[str]:
    """
    This function finds a compressed/consolidated representation of by allowing each cell
    to represent a range of version values (e.g "Guardium 11.0 - Guardium 11.5")

    Args:
        compat_data (List[List[str]]): Compat_Data is a 2d list of version values of multiple rows that have the same features
        key_ (List[str]): List of header values

    Returns:
        List[str]: _description_
    """

    # Remove duplicate rows if any
    compat_data = remove_duplicates_2d(compat_data)

    # Getting all uniq vals per each column from data
    uniq_column_vals_compat_data = get_uniq_vals_for_each_column(key_,compat_data)

    # Generate all possible ranges per each column using uniq vals (Can blow up computationally)
    all_ranges = []
    for x in key_:
        ranges = find_ranges(list(uniq_column_vals_compat_data[x]))
        all_ranges.append(ranges)

    # Generate all possible combinations using ranges per each column (Can blow up computationally)
    combinations_list = []
    y = combinations(all_ranges)
    for _,x in enumerate(y):
        combinations_list.append(Combination(x))

    # Check if each row of compat_data is compatible with any possible combination
    for _,row in enumerate(compat_data):
        for _,combo in enumerate(combinations_list):
            if combo.combo_allows_row(row):
                combo.add_row(row)

    # Sort combination from higher to lower capacity
    combinations_list = sorted(combinations_list, key=lambda x: -x.capacity)
    compat_data_copy = compat_data

    # This will represent those combinations which represent all rows of data
    final_combos = []

    # Loop thru each full capped combination and remove those lines from
    # compat_data_copy, that can be represented by that combination
    while len(compat_data_copy) != 0:
        for _,combo in enumerate(combinations_list):
            if combo.is_full_cap():
                compat_data_copy_new = subtract_lists(compat_data_copy,combo.rows)
                if len(compat_data_copy_new) != len(compat_data_copy):
                    compat_data_copy = compat_data_copy_new
                    combinations_list.remove(combo)
                    final_combos.append(combo)

    return [final_combo.key for final_combo in final_combos]
