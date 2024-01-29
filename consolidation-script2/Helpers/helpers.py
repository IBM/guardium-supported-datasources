from itertools import product
from typing import List

def subtract_lists(list_A:List[List[str]], list_B:List[List[str]]):
    # Check if all elements of list B are in list A
    if all(elem in list_A for elem in list_B):
        # Remove elements of list B from list A
        return [elem for elem in list_A if elem not in list_B]
    else:
        # Return list A unchanged
        return list_A


def product_of_lengths(lists: List[List[str]]) -> int:
    """
    Calculate the product of the lengths of each list in a list of lists.

    Args:
        lists (List[List[Any]]): A list of lists.

    Returns:
        int: The product of the lengths of each list.
    """
    product = 1
    for lst in lists:
        product *= len(lst)
    return product

def combinations(lists):
    return [list(comb) for comb in product(*lists)]


def find_ranges(ordered_list):
    """
    """
    ranges = []
    
    for i in range(0,len(ordered_list)+1):
        for j in range(i+1,len(ordered_list)+1):
            ranges.append(ordered_list[i:j])
        
    return ranges


def format_feature_a(key_,original_data):
    for i in original_data:
        assert(len(key_) == len(i))
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

