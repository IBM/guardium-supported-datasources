""" Just a collection of helper functions """
from itertools import product
from typing import List,Callable,Dict,Any
import json
import logging

def subtract_lists(list_a:List[List[str]], list_b:List[List[str]]) -> List[List[str]]:
    """ Return A - B, if all elements of B are in A """
    # Check if all elements of list B are in list A
    if all(elem in list_a for elem in list_b):
        # Remove elements of list B from list A
        return [elem for elem in list_a if elem not in list_b]
    else:
        # Return list A unchanged
        return list_a


def product_of_lengths(lists: List[List[str]]) -> int:
    """
    Calculate the product of the lengths of each list in a list of lists.

    Args:
        lists (List[List[Any]]): A list of lists.

    Returns:
        int: The product of the lengths of each list.
    """
    ret_product = 1
    for lst in lists:
        ret_product *= len(lst)
    return ret_product

def combinations(lists:List[List[Any]]) -> List[List[Any]]:
    """ Given a list of lists,
        return every possible permutation when taking an element from each sub-list

    eg. combinations([[1,2,3],["a","b"]]) 
        = [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b'], [3, 'a'], [3, 'b']]
    """
    return [list(comb) for comb in product(*lists)]


def find_ranges(ordered_list):
    """ Given an ordered list, return each possible sub-list
    eg. find_ranges([1,2,3,4]) = 
    [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [2], [2, 3], [2, 3, 4], [3], [3, 4], [4]]
    """
    ranges = [] 
    for i in range(0,len(ordered_list)+1):
        for j in range(i+1,len(ordered_list)+1):
            ranges.append(ordered_list[i:j])

    return ranges


def get_uniq_vals_for_each_column(key_,original_data):
    for i in original_data:
        if(len(key_) != len(i)):
            raise(TypeError(f"{i} must be same length as {key_} "))
    formatted_data = {}
    
    for i in key_:
        formatted_data[i] = set()

    for entry in original_data:
        for i,x in enumerate(key_):
            formatted_data[x].add(entry[i])
        # database_name, database_version, os_name, os_version = entry
        # formatted_data['DatabaseName'].add(database_name)
        # formatted_data['DatabaseVersion'].add(database_version)
        # formatted_data['OSName'].add(os_name)
        # formatted_data['OSVersion'].add(os_version)
    for i in key_:
        formatted_data[i] = sorted(formatted_data[i])

    return formatted_data

def is_index_between_range(ordered_list, range_tuple, element):
    start_index = ordered_list.index(range_tuple[0])
    end_index = ordered_list.index(range_tuple[1])
    element_index = ordered_list.index(element)
    
    return start_index <= element_index <= end_index


def has_duplicates_2d_lst(list_of_lists:List[List[str]]) -> bool:
    """
    Checks a 2d list for duplicate values
    """
    seen = set()
    for sublist in list_of_lists:
        for item in sublist:
            if item in seen and (item != "null" and item != ""):
                return True
            seen.add(item)
    return False

def has_duplicates_lst(lst:List[str]) -> bool:
    """
    Checks a list for duplicate value
    """
    return len(lst) != len(set(lst))

def remove_duplicates_2d(input_list:List[List[str]]) -> List[List[str]]:
    """
    Remove duplicates from a 2D list.

    Args:
        input_list (list of list of int): The 2D list from which to remove duplicates.

    Returns:
        list of list of int: The 2D list without duplicates.
    """
    unique_list = []
    seen = set()
    for sublist in input_list:
        # Convert the inner list to a tuple for hashability
        tuple_version = tuple(sublist)
        if tuple_version not in seen:
            seen.add(tuple_version)
            unique_list.append(sublist)

    return unique_list

def group_data_by_feature(data:List[List[str]],get_features:Callable[[List[str]],str],get_versions:Callable[[List[str]],List[str]]) -> Dict[str,List[str]]:
    """
        Splits a row into compat values and feature values.
        Returns a dict with feature set as key,
        and sets of corresponding versions values as the value 
        (in the form of a list).
        
    Args:
        data (List[List[str]]): The input data to be grouped.
        get_features (Callable[[List[str]], str]): Function to extract and combine feature values from a row.
        get_versions (Callable[[List[str]], List[str]]): Function to extract version values from a row.

    Returns:
        Dict[str, List[List[str]]]: A dictionary where keys are
        unique feature combinations and values are lists of version values.
    
    Example Usage:
    =======================
    data = [
        ['E001', 'Alice', 'HR', 'Recruiting'],
        ['E002', 'Bob', 'Engineering', 'Python'],
        ['E003', 'Charlie', 'HR', 'Payroll'],
        ['E004', 'Dave', 'Engineering', 'Python'],
        ['E005', 'Eve', 'Engineering', 'C++'],
        ['E006', 'Frank', 'HR', 'Recruiting'],
        ['E007', 'Grace', 'Engineering', 'C++'],
        ['E008', 'Hank', 'Engineering', 'Java']
    ]

    grouped_data = group_data_by_feature(
        data,
        get_features=lambda x: f"{x[2]}|+|{x[3]}",  # Combines Department and Skills into a unique string identifier
        get_versions=lambda x: [x[0], x[1]]  # Extracts EmployeeID and Name
    )

    # Resulting grouped_data:
    {
        'HR|+|Recruiting': [['E001', 'Alice'], ['E006', 'Frank']],
        'Engineering|+|Python': [['E002', 'Bob'], ['E004', 'Dave']],
        'HR|+|Payroll': [['E003', 'Charlie']],
        'Engineering|+|C++': [['E005', 'Eve'], ['E007', 'Grace']],
        'Engineering|+|Java': [['E008', 'Hank']]
    }
    """
    try:
        grouped_data = {}
        for row in data:
            feature = get_features(row)
            compat = get_versions(row)
            grouped_data.setdefault(feature, []).append(compat)
        logging.info("Data successfully grouped by features.")
        return grouped_data
    except Exception as e:
        logging.error("Error grouping data by features: %s", e)
        raise
    

def write_dict_to_json_file(file_path,data_dict):
    """
    Write a dictionary to a JSON file.

    Args:
        data_dict (dict): The dictionary to write.
        file_path (str): The path to the file where the JSON data will be written.
    """
    with open(file_path, 'w', encoding='utf-8-sig') as file:
        json.dump(data_dict, file, ensure_ascii=False, indent=4)



def concatenate_first_last_elements(input_lst: List[List[str]]) -> List[str]:
    """
    Concatenates the first and last elements of each sublist in A. If a sublist
    has only one element, it converts that element to a string.

    Args:
        A (List[List[Any]]): A list of lists.

    Returns:
        List[str]: A list of strings, each being either the concatenation of the
                   first and last elements of each sublist in A or the string representation
                   of the single element in sublists of length 1.
    """
    output_lst = [
        str(sublist[0]) if len(sublist) == 1 else str(sublist[0]) + " - " + str(sublist[-1])
        for sublist in input_lst if sublist
    ]
    return output_lst
