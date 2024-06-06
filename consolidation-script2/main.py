from Helpers.helpers import find_ranges,get_uniq_vals_for_each_column,combinations,subtract_lists
from Helpers.combination import Combination
from typing import List
from Helpers.helpers import group_data_by_feature,remove_duplicates_2d,write_dict_to_json_file
from Helpers.csv_helpers import read_csv_for_uniq_val,read_csv_get_unique_vals_in_column,write_csv_to_file,append_as_csv,append_as_json,read_csv_file_dict_reader

#TODO: MAJOR Cleanup
# example data
example = [
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'Ubuntu', 'Ubuntu 21.04'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'Windows', 'Windows 10'],
    ['11.0','Cassandra', 'Cassandra 4.0', 'Windows', 'Windows 10'],
    ["11.1",'DB2', 'DB2 11.5.7', 'SUSE', '15'],
    ['11.1','MariaDB', 'MariaDB 10.5', 'macOS', 'macOS 11.0'],
    ['11.1','MariaDB', 'MariaDB 10.6', 'Ubuntu', 'Ubuntu 22.04'],
    ['11.1','MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 8'],
    ['11.1','MongoDB', 'MongoDB 4.2', 'CentOS', 'CentOS 6'],
    ['11.2','MongoDB', 'MongoDB 4.2', 'Windows', 'Windows 10'],
    ['11.2','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
    ['11.3','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
    ["11.3",'MongoDB', 'MongoDB 4.6', 'CentOS', 'CentOS 8'],
    ["11.3",'Redis', 'Redis 7.2', 'Debian', 'Debian 11'],
]


def consolidate(output_json_path,output_csv_path, full_csv_path, header_key, full_key, partition_header_number, feature_key):
    #Instantiate output variables
    output_csv = []
    output_csv.append(full_key)
    output_json = {}

    # Get unique values in a column
    # (This will be used to partition the tabular data
    # before compression for efficiency)
    uniq_vals = read_csv_get_unique_vals_in_column(full_csv_path,partition_header_number)

    # Loop thru each uniq value
    for uniq_val in uniq_vals:
        output_json[uniq_val] = []

        # Partition data (Get subsection of data relating to current uniq_val)
        data = read_csv_for_uniq_val(full_csv_path,uniq_val,partition_header_number)
        
        
        # Group each row of data if they have the same features
        grouped_data = group_data_by_feature(data
                                             ,get_feature=lambda x: "|+|".join(x[len(header_key):]) # Convert list of features into a string
                                             ,get_compat=lambda x:x[0:len(header_key)])
        
        # Loop thru grouped_data such that each group represents rows with same features
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
    # _test(output_json_path,output_csv_path, full_csv_path, header_key, feature_key)


def _test(output_json_path,output_csv_path, full_csv_path, header_key, feature_key):
    # Open full_csv_path using Dict Reader
    input_data = read_csv_file_dict_reader(full_csv_path)
    print(f"input_data:{input_data[:5]}")
    
    compressed_data = read_csv_file_dict_reader(output_csv_path)
    print(f"compresssed_data:{compressed_data[:5]}")
    
    for input_row in input_data:
        matched = 0
        for compressed_row in compressed_data:
            # Check if header_key values match
            if (header_values_match(input_row,compressed_row,header_key)):   
                # if yes, then feature_key values must also match
                if (feature_values_match(input_row,compressed_row,feature_key)):
                    print(f"input_row:{input_row} \n compressed_row:{compressed_row} \n\n")
                    matched +=1
                else:
                    print(f"BIG ERROR: \n input_row:{input_row} \n compressed_row:{compressed_row} \n\n")
                    exit()
        # print(f"matched:{matched}")
        # assert(matched == 1)
            
def header_values_match(input_row,compressed_row,header_key):
    for header in header_key:
        if not (input_row[header] in tuple(eval(compressed_row[header]))):
            return False
        
    return True

def feature_values_match(input_row,compressed_row, feature_key):
    for feature in feature_key:
        if not (input_row[feature] == compressed_row[feature]):
            return False
    return True

def consolidate_per_feature(compat_data:List[str],key_:List[str]) -> List[str]:
    
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

    # Check if each row of data is compatible with any possible combination
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
