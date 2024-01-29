import csv
from typing import List

def read_csv_file(file_path):
    data = []
    with open(file_path, 'r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            data.append(row)
    return data

def check_value_in_row(data:List[str],column_index:int,value_to_check:str):
    return data[column_index] == value_to_check
    
    
def write_to_csv(data, file_path):
    with open(file_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(data)

def get_header_from_csv_file(file_path):
    data = None
    with open(file_path, 'r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            data = row
            break
    return data
