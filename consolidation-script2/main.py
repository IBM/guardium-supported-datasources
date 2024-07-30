from Helpers.helpers import find_ranges,get_uniq_vals_for_each_column,combinations,remove_if_all_present
from Helpers.combination import Combination
from typing import List
from Helpers.helpers import group_data_by_feature_availability_set,remove_duplicates_2d,write_dict_to_json_file
from Helpers.csv_helpers import read_csv_for_uniq_val,read_csv_get_unique_vals_in_column,write_csv_to_file,append_as_csv,append_as_json,read_csv_file_dict_reader
from Helpers.testing import _test


def consolidate(output_json_path,output_csv_path, input_csv_path, version_key, full_key, feature_key,partition_header_number,logger):
    """
    Consolidate and compress data from a CSV file,
        outputting the results to both a JSON and a CSV file.

    This function partitions the data based on unique values in a specified column,
    groups rows together that have the same feature availability values, 
    and consolidates rows that have the same features.
    
    The consolidated data is then saved in JSON and CSV formats.

    Args:
        output_json_path (str): The file path where the output JSON will be saved.
        output_csv_path (str): The file path where the output CSV will be saved.
        input_csv_path (str): The file path of the input CSV containing the full data.
        header_key (list): List of header keys to identify unique groups in the data.
        full_key (list): List of all keys/headers in the CSV.
        feature_key (list): List of feature keys to match values against.
        partition_header_number (int): The column index used for partitioning the data.
        

    Example:
        >>> consolidate('output.json', 'output.csv', 'data.csv', ['id', 'name'],
                                ['id', 'name', 'feature1', 'feature2'], 2, ['feature1', 'feature2'])
    
    Note:
        - 'feature availability values' refer to cell values in a row indicating the availability of a certain feature.
        - 'version values' refer to cell values in a row indicating versions of OS, Database, or Guardium etc.
    """

    #Instantiate output variables
    output_csv = []
    output_csv.append(full_key) # Add headers to first line of csv output
    output_json = {}

    # Get unique values in a column (eg. unique database names in database column)
    # (This will be used to partition the tabular data
    # before compression for efficiency)
    uniq_vals = read_csv_get_unique_vals_in_column(input_csv_path,partition_header_number)
    logger.debug("Stored all unique vals of column #:%s ", partition_header_number)

    # Loop thru each uniq value
    for uniq_val in uniq_vals:
        output_json[uniq_val] = [] # Will store consolidated data for specific uniq_val

        # Partition data (Get subsection of all rows with uniq_val in the partition_header_number)
        data = read_csv_for_uniq_val(input_csv_path,uniq_val,partition_header_number)
        logger.debug("Partitioned Data for %s",uniq_val)


        # Group rows of data based on their feature availability values,
        # Returns a dict with a string key (representing feature values) and,
        # Lists of lists of strings (representing version values from multiple rows) as values
        # Therefore, each list of strings concatenated with the corresponding key, recreates the original row
        grouped_data = group_data_by_feature_availability_set(data
                                             ,get_features=lambda x: "|+|".join(x[len(version_key):]) # Combine feature values into a unique string identifier
                                             ,get_versions=lambda x:x[0:len(version_key)]
                                             ,logger=logger) # Extract header key values
        # The 'get_features' function combines the feature availability values of each row into a single string, acting as a unique identifier for a grouping
        # The 'get_versions' function extracts the version values from each row 


        # Loop thru grouped_data dictionary
        # Each key represents a set of a feature availabilities
        # Each value is a list a list of versions values
        for set_of_feature_availability,_ in grouped_data.items():
            feature_availability_list = set_of_feature_availability.split('|+|') # Convert back into list
            assert(len(feature_availability_list) == (len(full_key)-len(version_key)))

            logger.info("Performing Cartesian Decomposition for Uniq Val: %s and Feature Set: %s",uniq_val ,feature_availability_list)
            # Consolidate/Compress rows of data that have same feature
            consolidated_version_rows = cartesian_decomposition(grouped_data[set_of_feature_availability],version_key,logger,input_csv_path)

            # Append consolidated information as json and csv
            append_as_json(full_key, output_json, uniq_val, feature_availability_list, consolidated_version_rows)
            append_as_csv(full_key, output_csv, feature_availability_list, consolidated_version_rows)


    _test(output_csv_path, input_csv_path, version_key, feature_key,logger)

    write_csv_to_file(output_csv_path,output_csv)
    write_dict_to_json_file(output_json_path,output_json)



def cartesian_decomposition(version_data:List[List[str]],key_:List[str],logger,input_csv_path) -> List[List[List[str]]]:
    """
    Performs Cartesian Product Decomposition on the given tabular data.

    This function finds a compressed/consolidated representation of multiple rows 
    by allowing each cell to represent an ordered lists of version values (e.g ["Guardium 11.0", "Guardium 11.1"])
    
    The original data can be reconstructed by taking the Cartesian product within each sub-list

    Args:
        compat_data (List[List[str]]): Compat_Data is a 2d list of version values of multiple rows that have the same features
        key_ (List[str]): List of header values

    Returns:
        List[List[List[str]]]: _description_
        
    Example Usage:
        compat_data = [

        ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7'],
        ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
        ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
        ['11.1','MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 6'],
        ['11.1','MongoDB', 'MongoDB 4.2', 'CentOS', 'CentOS 6'],
        ['11.1','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 6'],
        ['11.1','MongoDB', 'MongoDB 4.6', 'CentOS', 'CentOS 6'],
        ['11.1','MongoDB', 'MongoDB 4.7', 'CentOS', 'CentOS 6'],
        ['11.1','MongoDB', 'MongoDB 4.8', 'CentOS', 'CentOS 6'],
        ["11.1",'DB2', 'DB2 11.5.7', 'SUSE', '15'],
        ]
        
        header_key = [
        "Guardium_Version","DB_Name", "DB_Version", "OS_Name", "OS_Version" 
        ]
        
        cartesian_decomposition(compat_data=compat_data,key_=header_key) returns 
        [
        [['11.1'], ['MongoDB'], ['MongoDB 4.0', 'MongoDB 4.2', 'MongoDB 4.4', 'MongoDB 4.6', 'MongoDB 4.7', 'MongoDB 4.8'], ['CentOS'], ['CentOS 6']],
        [['11.0'], ['Cassandra'], ['Cassandra 3.11.10'], ['CentOS'], ['CentOS 7', 'CentOS 8']],
        [['11.1'], ['DB2'], ['DB2 11.5.7'], ['SUSE'], ['15']],
        ]
        
        

    """

    # Remove duplicate rows if any
    version_data = remove_duplicates_2d(version_data)
    logger.debug("Removed duplicate lines")

    # Getting all uniq vals per each column from data
    uniq_column_vals_compat_data = get_uniq_vals_for_each_column(key_,version_data)
    logger.debug("Stored all uniq vals in each column")
    # Returns a dict, where key is the column name,
    # and value is a list of unique vals in that column

    # Generate all possible ranges (ordered subsets) per each column using uniq vals (Can blow up computationally)
    all_ranges = []
    for x in key_:
        ranges = find_ranges(list(uniq_column_vals_compat_data[x]))
        all_ranges.append(ranges)
    logger.debug("Generated all possible ordered set of uniq vals of each column")

    # Generate all possible combinations using ranges for each column (Can blow up computationally)
    # Save each combination as a Combination Object
    combinations_list = []
    y = combinations(all_ranges)
    for _,x in enumerate(y):
        combinations_list.append(Combination(x))
    logger.debug("Generated all possible combinations of uniq val ordered sets of each column")

    # Check if each row of compat_data is compatible with any possible combination
    for _,row in enumerate(version_data):
        for _,combo in enumerate(combinations_list):
            # Check if row is compatible with combo (Cartesian product of combo includes row)
            if combo.combo_allows_row(row):
                combo.add_row(row)
    logger.debug("Referenced all data rows with all possible combinations")

    # Sort combination from higher to lower capacity
    combinations_list = sorted(combinations_list, key=lambda x: -x.capacity)
    version_data_copy = version_data

    # This will represent those combinations which represent all rows of data
    final_combos = []

    # Loop thru each full capped combination and remove those lines from compat_data_copy,
    # that can be represented by that combination
    while len(version_data_copy) != 0:
        for _,combo in enumerate(combinations_list):
            if combo.is_full_cap():
                version_data_copy_filtered = remove_if_all_present(version_data_copy,combo.rows)
                if len(version_data_copy_filtered) != len(version_data_copy): 
                    version_data_copy = version_data_copy_filtered
                    combinations_list.remove(combo)
                    final_combos.append(combo)

    #Assertion that total number of rows represented by final_combos
    # is same as original number of rows
    assert len(version_data) == sum([final_combo.flow for final_combo in final_combos])
    
    logger.critical("Found %s combinations representing %s rows in %s", len(final_combos), len(version_data),input_csv_path)

    return [final_combo.key for final_combo in final_combos]
