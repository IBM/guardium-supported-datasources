""" Just a collection of helper function related to csv read/write actions
"""
import csv
from typing import List

def read_csv_file(file_path) -> List[List[str]]:
    """ Reads CSV file given path"""
    data = []
    with open(file_path, 'r', encoding="utf-8", newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            data.append(row)
    return data

def read_csv_for_db(file_path:str,db_name:str,header_number:int) -> List[List[str]]:
    """ Reads CSV file given path, 
    will only return rows with a certain value in a certain column """
    data = []
    with open(file_path,encoding="utf-8") as f:
        reader = csv.reader(f)
        # Iterate through each row
        for row in reader:
            if row[header_number].strip() == db_name:
                data.append(row)
    return data

def read_csv_get_unique_db_names(file_path:str,header_number:int) -> List[str]: #TODO: Generalize this
    """ Gets all unique values from a certain column from csv file """
    dbs = set()
    with open(file_path,encoding="utf-8") as f:
        reader = csv.reader(f)
        # Iterate through each row
        for row in reader:
            if row[header_number].strip not in dbs:
                dbs.add(row[header_number])
    return list(dbs)

def write_csv_to_file(file_path:str,data:List[List[str]]):
    """ Writes a 2D List into CSV file given path """
    # Open the CSV file in write mode
    with open(file_path, mode='w',encoding="utf-8", newline='') as file:
        # Create a CSV writer
        writer = csv.writer(file)

        # Write the 2D list to the CSV file
        writer.writerows(data)
