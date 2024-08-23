""" Just a collection of helper functions """
from itertools import product
from functools import cmp_to_key
from typing import List,Callable,Dict,Any
import json
import re

def is_sublist(lst, sublst):
    lst_str = ''.join(lst)
    sublst_str = ''.join(sublst)
    return (sublst_str in lst_str or lst_str in sublst_str)


def split_string(s):
    return [float(x) if re.match(r'^[+-]?\d+(\.\d+)?$', x) else x 
            for x in re.split(r'(\d+\.?\d*)', s) if x]

def compare_lists(lista, listb):
    min_len = min(len(lista), len(listb))
    
    for i in range(min_len):
        a, b = lista[i], listb[i]
        
        # If both are numbers, compare numerically
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            if a != b:
                return -1 if a < b else 1
            
        # If one is a number and the other is a string, treat string as smaller
        elif isinstance(a, (int, float)) and isinstance(b, str):
            return 1  # Numbers come after strings
        
        elif isinstance(a, str) and isinstance(b, (int, float)):
            return -1  # Strings come before numbers
        
        # If both are strings, compare alphabetically
        else:
            if a != b:
                return -1 if a < b else 1
    
    # If all elements compared are equal, the longer list is considered larger
    return len(lista) - len(listb)



def remove_if_all_present(list_a:List[List[str]], list_b:List[List[str]]) -> List[List[str]]:
    """ 
    Return A - B, if (all elements of B are in A) else return A unchanged
    
    Parameters:
    list_a (List[List[str]]): The main list of lists containing strings.
    list_b (List[List[str]]): The list of lists containing strings to check against `list_a`.

    Returns:
    List[List[str]]: A filtered version of `list_a` or the original `list_a` based on the condition.
    
    """
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
        lists (List[List[str]]): A list of lists containing strings.

    Returns:
        int: The product of the lengths of each list.
    
    Example:
        lists = [["apple", "banana", "cherry"], ["dog", "elephant"], ["fish", "goat"]]
        result = product_of_lengths(lists)
        # result will be 3 * 2 * 2 = 12
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


def find_ranges(search_space:List[str]) -> List[List[str]]:
    """ Given an ordered list, return each possible sub-list
    eg. find_ranges([1,2,3,4]) = 
    [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [2], [2, 3], [2, 3, 4], [3], [3, 4], [4]]
    """
    ranges = []
    for i in range(0,len(search_space)+1):
        for j in range(i+1,len(search_space)+1):
            ranges.append(search_space[i:j])

    return ranges

def find_relevant_ranges(search_space:List[str],relevant_list:List[str]) -> List[List[str]]:
    """
    Find all sublists of `search_space` that are sublists of `relevant_list`.

    This function iterates over all possible sublists of `search_space` and checks if 
    they are sublists of `relevant_list`. If a sublist matches, it is added to the 
    result list.

    Args:
        search_space (List[int]): The list from which sublists are generated.
        relevant_list (List[int]): The list against which sublists are checked.

    Returns:
        List[List[int]]: A list of sublists from `search_space` that are also sublists 
        of `relevant_list`.

    Examples:
        >>> search_space = [1, 2, 3, 4, 5]
        >>> relevant_list = [2, 3, 4]
        >>> find_relevant_ranges(search_space, relevant_list)
        [[2], [2, 3], [2, 3, 4], [3], [3, 4], [4]]

        >>> search_space = [1, 3, 5]
        >>> relevant_list = [1, 2, 3, 4, 5]
        >>> find_relevant_ranges(search_space, relevant_list)
        [[1], [3], [5]]
    """

    ranges = []
    for i in range(0,len(search_space)+1):
        for j in range(i+1,len(search_space)+1):
            if (is_sublist(search_space[i:j],relevant_list)):
                ranges.append(search_space[i:j])

    return ranges


def get_uniq_vals_for_each_column(key_:List[str],
                                  original_data:List[List[str]]) -> Dict[str, List[str]]:
    """
    Extracts and sorts unique values for each column from the original data.

    Args:
        key_ (List[str]): A list of keys corresponding to the columns of the original data.
        original_data (List[List[str]]): A list of lists containing the tabular data.

    Returns:
        Dict[str, List[str]]: A dictionary where each key maps
        to a sorted list of unique values from the original data.

    Raises:
        TypeError: If any entry in original_data does not have the same length as key_.
    
    Example:
        key_ = ['version', 'db', 'db_version', 'os', 'os_version']
        original_data = [
            ['11.0', 'Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 7'],
            ['11.0', 'Cassandra', 'Cassandra 3.11.10', 'CentOS', 'CentOS 8'],
            ['11.1', 'MongoDB', 'MongoDB 4.0', 'CentOS', 'CentOS 6']
        ]
        result = get_uniq_vals_for_each_column(key_, original_data)
        # result will be:
        # {
        #     'version': ['11.0', '11.1'],
        #     'db': ['Cassandra', 'MongoDB'],
        #     'db_version': ['Cassandra 3.11.10', 'MongoDB 4.0'],
        #     'os': ['CentOS'],
        #     'os_version': ['CentOS 6', 'CentOS 7', 'CentOS 8']
        # }
    """
    for i in original_data:
        if len(key_) > len(i):
            raise TypeError(f"{i} must be greater length than {key_} ")
    formatted_data = {}

    for i in key_:
        formatted_data[i] = set()

    for entry in original_data:
        for i,x in enumerate(key_):
            formatted_data[x].add(entry[i])
    for i in key_:
        formatted_data[i] = sorted(
        formatted_data[i],
        key=cmp_to_key(lambda x, y: compare_lists(split_string(x), split_string(y)))
        )
        

    return formatted_data


def has_duplicates_2d_lst(list_of_lists:List[List[str]]) -> bool:
    """
    Checks a 2D list for duplicate values, ignoring "null" and empty string values.

    Args:
        list_of_lists (List[List[str]]): A 2D list containing sublists of strings.

    Returns:
        bool: True if there are duplicate values (excluding "null" and ""), False otherwise.

    Example:
        lists_with_duplicates = [["apple", "banana", "cherry"], ["dog", "banana"], ["fish", ""]]
        result_with_duplicates = has_duplicates_2d_lst(lists_with_duplicates)
        # result_with_duplicates will be True because "banana" is a duplicate
        
        lists_with_duplicates = [['apple', 'apple'], ['banana']
        result_with_duplicates = has_duplicates_2d_lst(lists_with_duplicates)
        # result_with_duplicates will be True because "apple" is a duplicate
        
        lists_without_duplicates = 
            [["apple", "banana", "cherry"], ["dog", "elephant"], ["fish", ""]]
        result_without_duplicates = has_duplicates_2d_lst(lists_without_duplicates)
        # result_without_duplicates will be False because there are no duplicates
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
        
    Example:
        input_list = [["apple", "banana"], ["apple", "banana"], ["cherry"], ["apple", "cherry"]]
        result = remove_duplicates_2d(input_list)
        # result will be [["apple", "banana"], ["cherry"], ["apple", "cherry"]]
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

def group_data_by_feature_availability_set(data:List[List[str]],
                                           get_features:Callable[[List[str]],str],
                                           get_versions:Callable[[List[str]],List[str]],
                                           logger) -> Dict[str,List[str]]:
    """
    Groups rows of data based on specific features and associates them with version values.

    This function processes a list of data rows where each row contains various attributes.
    It groups the rows by unique combinations of feature values extracted using the provided
    function, and maps these groups to the corresponding version values, also extracted using
    a provided function.
        
    Args:
        data (List[List[str]]): The input data to be grouped.
        get_features (Callable[[List[str]], str]): 
                            Function to extract and combine feature values from a row.
        get_versions (Callable[[List[str]], List[str]]): 
                            Function to extract version values from a row.

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
        get_features=
            lambda x: f"{x[2]}|+|{x[3]}",  # Combines Dept. and Skills into a uniq identifier
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
        logger.info("Successfully grouped data by features")
        return grouped_data
    except Exception as e:
        logger.error("Error grouping data by features: %s", e)
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


def pretty_print_row(row):
    """
        Pretty print the key-value pairs of a dictionary row.

        Args:
            row (dict): A dictionary containing key-value pairs to be printed.

        Example:
            >>> pretty_print_row({'name': 'John', 'age': 30})
            name: John
            age: 30
        """
    for key in row.keys():
        print(f"{key}:{row[key]}")
    print("\n")


def add_supported_database(json_data, database_name, environment_name, method_name):
    # Find the database if it exists, or create it
    db = next((db for db in json_data["supported_databases"] if db["database_name"] == database_name), None)
    if not db:
        db = {"database_name": database_name, "environments_supported": []}
        json_data["supported_databases"].append(db)

    # Find the environment if it exists, or create it
    env = next((env for env in db["environments_supported"] if env["environment_name"] == environment_name), None)
    if not env:
        env = {"environment_name": environment_name, "methods_supported": []}
        db["environments_supported"].append(env)

    # Add the method if it doesn't already exist
    if not any(method['method_key'] == method_name for method in env['methods_supported']):
        env["methods_supported"].append({"method_key": method_name})
