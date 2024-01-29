from Consolidator.cell import Cell
from Consolidator.row import Row
from Consolidator.consolidator import Consolidator
from Consolidator.column_helper import ColumnHelper
from Helpers.csv_helpers import read_csv_file,check_value_in_row,write_to_csv,get_header_from_csv_file
from functools import partial
from itertools import groupby
from Helpers.graph_helpers import get_edges_for_given_node
from Helpers.helpers import find_ranges,format_feature_a,combinations,subtract_lists
from Helpers.combination import Combination

FULL_CSV_PATH="/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/supported_dbs.csv"
MONGO_CSV_PATH="/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/consolidation-script2/data/supported_dbs_clean.csv"

# data = read_csv_file(FULL_CSV_PATH)
# partial_cvir = partial(check_value_in_row,column_index=3,value_to_check="MongoDB")
# data_filtered = list(filter(partial_cvir,data))
# print(len(data_filtered))
# write_to_csv(data_filtered,MONGO_CSV_PATH)

# headers = get_header_from_csv_file(MONGO_CSV_PATH)
# compat_headers = headers[:5]
# feature_headers = headers[5:]
# data = read_csv_file(MONGO_CSV_PATH)
# data_dict = {}
# for row in data[1:13]:
#     feature_info = str(row[5:])
#     if feature_info not in data_dict.keys():
#         data_dict[feature_info] = {
#             "nodes":[],
#             "edges":[]
#         }
#         for compat_val in row[:5]:
#             data_dict[feature_info]["nodes"].append([compat_val])
        
#     else:
#         for i,cell in enumerate(row[:5]):
#             if cell not in data_dict[feature_info]["nodes"][i]:
#                 data_dict[feature_info]["nodes"][i].append(cell)
#     edge = row[:5]
#     data_dict[feature_info]["edges"].append(edge)
    
# last_key = list(data_dict.keys())[-1]
# print(last_key)
# print("\n\n")
# print(data_dict[last_key]["nodes"])
# print("\n")
# print(data_dict[last_key]["edges"])
# print("\n")
# print(get_edges_for_given_node("MongoDB 4",data_dict[last_key]["edges"]))
# print(get_edges_for_given_node("MongoDB 3.6",data_dict[last_key]["edges"]))


#TODO: Model as network problem, total_flow = total_connections
# generate all possible combinations nodes (how many would this be = n^2 + n^2 + n^2 nodes)
# instead of capacity constraints, you have equality conditions (But ford fulkerson wouldn't work)
# but you can "calculate" capacity, based on some equality conditions

# each connection is a row in the csv

#TODO: Get all the nodes by looping thru csv (i.e. if  GV:[11.1,11.2,11.3] = 
# nodes([("11.1",1),("11.2",1),("11.3",1),("11.1-11.2",2),("11.1-11.3",2),("11.2-11.3",1)])
# ) + their capacity 
# similarly for db version and os version once you order them
# nothing for os's and dbnames
#TODO: Get all the edges by looping thru csv
# for each row:
    #edges =
    # for ind,val in each enumerate(cell): # L to R 
    #   if val in network.nodes_by_layer(ind):
            # this should always be true, right?
            # edge with flow (flow should be flow rows)


#TODO: V3
#TODO: get list of all possible edges = i.e all possible combos of nodes: n^(2*(no.of.headers?))?




# Original data for Feature A
original_feature_a = [
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'Ubuntu', 'Ubuntu 21.04'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7'],
    ['11.0','Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
    ['11.0','Cassandra', 'Cassandra 4.0', 'CentOS', 'CentOS 8'],
    ['11.0','Cassandra', 'Cassandra 4.0', 'Windows', 'Windows 10'],
    # ['DB2', 'DB2 11.5.7', 'SUSE', '15'],
    ['11.1','MariaDB', 'MariaDB 10.5', 'macOS', 'macOS 11.0'],
    ['11.1','MariaDB', 'MariaDB 10.6', 'Ubuntu', 'Ubuntu 22.04'],
    ['11.1','MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 8'],
    ['11.1','MongoDB', 'MongoDB 4.2', 'CentOS', 'CentOS 6'],
    ['11.2','MongoDB', 'MongoDB 4.2', 'Windows', 'Windows 10'],
    ['11.2','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
    ['11.3','MongoDB', 'MongoDB 4.4', 'CentOS', 'CentOS 7'],
    # ['MongoDB', 'MongoDB 4.6', 'CentOS', '8'),
    # ['Redis', 'Redis 7.2', 'Debian', '11')
]

original_feature_a_early = [(x[:5],",".join(x[5:])) for x in read_csv_file(MONGO_CSV_PATH)[1:]]
original_feature_a_early.sort(key=lambda x: x[1])


# Group the list by age
grouped_people = {}
for key, group in groupby(original_feature_a_early, key=lambda x: x[1]):
    grouped_people[key] = list([x[0] for x in group])

# print(grouped_people[grouped_people.keys[0]])
for i in grouped_people.keys():
    original_feature_a = grouped_people[i]
    break


print(len(original_feature_a))


key_ = ['GuardiumVersion',
        'OSName',
        'OSVersion',
        'DatabaseName',
        'DatabaseVersion']

# Formatting the data
formatted_feature_a = format_feature_a(key_,original_feature_a)

# Displaying the formatted data
print("Formatted Version:")
print("Feature A:")
for key, value in formatted_feature_a.items():
    print(f"{key}: {value}")



all_ranges = []
for x in key_:
    ranges = find_ranges(list(formatted_feature_a[x]))
    all_ranges.append(ranges)
    
combinations_list = []
y = combinations(all_ranges)

print(type(y))
for i,x in enumerate(y):
    combinations_list.append(Combination(x))
print(combinations_list[1])









for i,row in enumerate(original_feature_a):
    for j,combo in enumerate(combinations_list):
        if (combo.combo_allows_row(row)):
            combo.add_row(row)

print(combinations_list[1])

for i,combo in enumerate(combinations_list):
    if (combo.is_full_cap()):
        print(combo)
        print("\n")

combinations_list = sorted(combinations_list, key=lambda x: -x.capacity)
print("blah")
print(combinations_list[0])
final_combos = []
original_feature_a_copy = original_feature_a
# while sum([x.length for x in final_combos]) != len(original_feature_a):
count = 0
while (len(original_feature_a_copy) != 0) and (count < 300) :
    count += 1
    print("again"+str(count))
    for i,combo in enumerate(combinations_list):
        if (combo.is_full_cap()):
            original_feature_a_copy_new = subtract_lists(original_feature_a_copy,combo.rows)
            if len(original_feature_a_copy_new) != len(original_feature_a_copy):
                original_feature_a_copy = original_feature_a_copy_new
                combinations_list.remove(combo)
                final_combos.append(combo)
        
        
print(len(final_combos))
print(original_feature_a_copy)
print(len(final_combos))

for final_combo in final_combos:
    print(final_combo)
    print("\n")
    

    
# TODO:Given ranges from all layers ([11.1,11.2],[RedHat,CentOS],[Mongo1,Mongo2,Mongo3]) find x no. of rows for each combo
# if row.contains
# take intersection, and you get valid rows for [Mongo1,Mongo2,Mongo3]





# TODO: each node must have a list attached to it
# TODO: for each row, for each cell, find nodes whose list include this cell's value