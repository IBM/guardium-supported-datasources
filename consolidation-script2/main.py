from Helpers.helpers import find_ranges,get_uniq_vals_for_each_column,combinations,subtract_lists
from Helpers.combination import Combination
from typing import List
from Helpers.helpers import group_data_by_feature,remove_duplicates_2d,write_dict_to_json_file,concatenate_first_last_elements
from Helpers.csv_helpers import read_csv_for_uniq_val,read_csv_get_unique_vals_in_column,write_csv_to_file, read_csv_file

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



def consolidate_per_feature(compat_data:List[str],key_:List[str]) -> List[str]:
    
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
    # data, that can be represented by that combination
    while len(compat_data_copy) != 0:

        for _,combo in enumerate(combinations_list):
            if combo.is_full_cap():
                compat_data_copy_new = subtract_lists(compat_data_copy,combo.rows)
                if len(compat_data_copy_new) != len(compat_data_copy):
                    compat_data_copy = compat_data_copy_new
                    combinations_list.remove(combo)
                    final_combos.append(combo)

    return [final_combo.key for final_combo in final_combos]

def consolidate(output_json_path,output_csv_path, full_csv_path, header_key, full_key, partition_header_number):
    output = []
    output.append(full_key)
    output_json = {}

    # Get unique values in a column
    # (This will be used to partition the tabular data
    # before compression for efficiency and readability uses)
    uniq_vals = read_csv_get_unique_vals_in_column(full_csv_path,partition_header_number)

    for uniq_val in uniq_vals:
        output_json[uniq_val] = []

        # Patition data
        data = read_csv_for_uniq_val(full_csv_path,uniq_val,partition_header_number)
        
        # Group each line of tabular data if they represent the same features
        grouped_data = group_data_by_feature(data
                                             ,get_feature=lambda x: "+".join(x[len(header_key):]) # Convert list of features into a string
                                             ,get_compat=lambda x:x[0:len(header_key)])

        for ikey,_ in grouped_data.items():
            feature_list = ikey.split('+') # Convert back into list
            #TODO: Need a lot asserting here?
            print(f"feature_list:{feature_list}={len(feature_list)}")
            print(f"full_key:{full_key}={len(full_key)}")
            print(f"header_key:{header_key}={len(header_key)}")
            assert(len(feature_list) == (len(full_key)-len(header_key)))
            
            xss = consolidate_per_feature(grouped_data[ikey],header_key)
            
            for xs in xss:
                
                full_line = xs + feature_list
                print(f"full_line:{full_line}")
                print(f"pre_full_lline:{xs + feature_list}")
                print("\n")
                assert(len(full_line) == len(full_key))
                xss_json = {}
                for i,val in enumerate(full_key):
                    xss_json[val] = full_line[i]
                output_json[uniq_val].append(xss_json)

            for xs in xss:
                xs_str = [f"{str(x).replace('[','(').replace(']',')')}" for x in xs]
                full_line = xs_str + feature_list
                assert(len(full_line) == len(full_key))
            
                print(f"{len(full_line)}={len(xs_str)}+{len(feature_list)}xxxxx;{full_line}")
                output.append(full_line)
            
        print(len(output))
    
            
        print("____________________________DONZO BOZO______________________________________")






    write_csv_to_file(output_csv_path,output)
    write_dict_to_json_file(output_json_path,output_json)


#TODO: TESTING