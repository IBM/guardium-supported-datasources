from Helpers.helpers import find_ranges,format_feature_a,combinations,subtract_lists
from Helpers.combination import Combination
from typing import List
from Helpers.helpers import group_data_by_feature
from Helpers.csv_helpers import read_csv_for_db,read_csv_get_unique_db_names,write_csv_to_file



FULL_CSV_PATH="/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/supported_dbs.csv"
MONGO_CSV_PATH="/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/consolidation-script2/data/supported_dbs_clean.csv"


# Original data for Feature A
# original_feature_a = [
#     ['11.0','Cassandra', 'Cassandra 3.11.10', 'Ubuntu', 'Ubuntu 21.04'],
#     ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7'],
#     ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
#     ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
#     ['11.0','Cassandra', 'Cassandra 3.11.10', 'Windows', 'Windows 10'],
#     ['11.0','Cassandra', 'Cassandra 4.0', 'Windows', 'Windows 10'],

#     # # ['DB2', 'DB2 11.5.7', 'SUSE', '15'],
#     # ['11.1','MariaDB', 'MariaDB 10.5', 'macOS', 'macOS 11.0'],
#     # ['11.1','MariaDB', 'MariaDB 10.6', 'Ubuntu', 'Ubuntu 22.04'],
#     # ['11.1','MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 8'],
#     # ['11.1','MongoDB', 'MongoDB 4.2', 'CentOS', 'CentOS 6'],
#     # ['11.2','MongoDB', 'MongoDB 4.2', 'Windows', 'Windows 10'],
#     # ['11.2','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
#     # ['11.3','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
#     # ['MongoDB', 'MongoDB 4.6', 'CentOS', '8'),
#     # ['Redis', 'Redis 7.2', 'Debian', '11')
# ]



def consolidate_per_feature(original_feature_a:List[str],key_:List[str]) -> List[str]:
    
# Formatting the data
    formatted_feature_a = format_feature_a(key_,original_feature_a)


    all_ranges = []
    for x in key_:
        ranges = find_ranges(list(formatted_feature_a[x]))
        all_ranges.append(ranges)
    
    combinations_list = []
    y = combinations(all_ranges)

    
    for i,x in enumerate(y):
        combinations_list.append(Combination(x))










    for i,row in enumerate(original_feature_a):
        for j,combo in enumerate(combinations_list):
            if (combo.combo_allows_row(row)):
                combo.add_row(row)


    combinations_list = sorted(combinations_list, key=lambda x: -x.capacity)
    final_combos = []
    original_feature_a_copy = original_feature_a
    # while sum([x.length for x in final_combos]) != len(original_feature_a):
    count = 0
    while (len(original_feature_a_copy) != 0) and (count < 300) :
        count += 1
        
        for i,combo in enumerate(combinations_list):
            if (combo.is_full_cap()):
                original_feature_a_copy_new = subtract_lists(original_feature_a_copy,combo.rows)
                if len(original_feature_a_copy_new) != len(original_feature_a_copy):
                    original_feature_a_copy = original_feature_a_copy_new
                    combinations_list.remove(combo)
                    final_combos.append(combo)
        
        
    # TODO: Assert flow == cap?    
        
    return [final_combo.key for final_combo in final_combos]
        
        
    
    

# consolidate_per_feature(original_feature_a)
    
    

    
def consolidate(output_csv_path, full_csv_path, header_key, full_key, db_header_number):
    dbs = read_csv_get_unique_db_names(full_csv_path,db_header_number)
    output = []
    output.append(full_key)

    for db in dbs: 
        data = read_csv_for_db(full_csv_path,db,db_header_number)
        grouped_data = group_data_by_feature(data,lambda x: "+".join(x[len(header_key):]),lambda x:x[0:len(header_key)]) 
        for i in grouped_data:
            feature_list = i.split('+') #TODO: Need a lot asserting here
            xss = consolidate_per_feature(grouped_data[i],header_key)
            for xs in xss:
                xs_str = [f"{str(x).replace('[','(').replace(']',')')}" for x in xs]
                full_line = xs_str + feature_list
                assert(len(full_line) == len(full_key))
            
                print(f"{len(full_line)}={len(xs_str)}+{len(feature_list)}xxxxx;{full_line}")
                output.append(full_line)
            
        print(len(output))
    
            
        print("____________________________DONZO BOZO______________________________________")






    write_csv_to_file(output_csv_path,output)