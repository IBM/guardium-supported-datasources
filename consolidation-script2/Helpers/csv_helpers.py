""" Just a collection of helper function related to csv read/write actions
"""
import csv
from typing import List

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
    will only return rows with a certain value in a certain column """
    data = []
    with open(file_path,encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        # Iterate through each row
        for row in reader:
            if row[header_number].strip() == db_name:
                data.append(row)
    return data

def read_csv_get_unique_vals_in_column(file_path:str,header_number:int) -> List[str]: #TODO: Generalize this
    """ Gets all unique values from a certain column from csv file without the header"""
    is_header = True
    dbs = set()
    with open(file_path,encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        # Iterate through each row
        for row in reader:
            if is_header:
                is_header = False
                continue
            
            if row[header_number].strip() not in dbs:
                dbs.add(row[header_number].strip())
    return list(dbs)

def write_csv_to_file(file_path:str,data:List[List[str]]):
    """ Writes a 2D List into CSV file given path """
    # Open the CSV file in write mode
    with open(file_path, mode='w',encoding="utf-8-sig", newline='') as file:
        # Create a CSV writer
        writer = csv.writer(file)

        # Write the 2D list to the CSV file
        writer.writerows(data)

def append_as_csv(full_key, output_csv, feature_list, xss):
    for xs in xss:
        xs_str = [f"{str(x).replace('[','(').replace(']',')')}" for x in xs]
        full_line = xs_str + feature_list
        assert(len(full_line) == len(full_key))
            
        output_csv.append(full_line)

def append_as_json(full_key, output_json, uniq_val, feature_list, xss):
    for xs in xss:
        full_line = xs + feature_list
        assert(len(full_line) == len(full_key))
        
        xss_json = {}
        for i,val in enumerate(full_key):
            xss_json[val] = full_line[i]
        output_json[uniq_val].append(xss_json)
