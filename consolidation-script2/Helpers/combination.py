"""Models a certain combination.
"""
import dataclasses
from typing import List
from Helpers.helpers import product_of_lengths,has_duplicates_lst,has_duplicates_2d_lst


@dataclasses.dataclass
class Combination:
    """
    Defined with a 2D-List Key which 
    represents all possible lists generated by taking the 
    Cartesian Product of all sub-list
    
    Eg. combo_example = Combination(keys=[
                                    ["11.0","11.1","11.2"]
                                    ,["MongoDB"]
                                    ,["RedHat","CentOS","Windows"]
                                    ])
        which represents 
        [
            ['11.0', 'MongoDB', 'RedHat'],
            ['11.0', 'MongoDB', 'CentOS'],
            ['11.0', 'MongoDB', 'Windows'],
            ['11.1', 'MongoDB', 'RedHat'],
            ['11.1', 'MongoDB', 'CentOS'],
            ['11.1', 'MongoDB', 'Windows'],
            ['11.2', 'MongoDB', 'RedHat'],
            ['11.2', 'MongoDB', 'CentOS'],
            ['11.2', 'MongoDB', 'Windows']
        ]
    

    Args:
        keys (List[List[str]]): A list of lists where the n-th list 
                                represents the allowed elements for the n-th column
        
    Attributes:
        length (int): Number of total columns
        keys (List[List[str]]): A list of lists of strings representing the elements 
                                to take cartesian product of.
        capacity (int): Number of unique permutation generated from keys
        rows: List[List[str]]: List of lists,
                                where each list represents a row from a csv file. 
                                This row must be an allowed permutation of the keys.
        flow: Number of rows 
        

    Raises:
        TypeError: If keys is not a list of lists of strings.
    """
    length: int
    key: List[List[str]]
    capacity: int
    flow: int
    rows: List[List[str]]

    def __init__(self, key: List[List[str]]) -> None:
        cleaned_key = [lst for lst in key if (lst != [''] and lst != ['null'])]
        if (has_duplicates_2d_lst(cleaned_key)
        or any((has_duplicates_lst(lst)) for lst in key)):
            raise TypeError(f"keys must be a unique list of \
                            lists of strings, instead we got:{key}")

        self.key = key
        self.capacity = product_of_lengths(key)
        self.flow = 0
        self.length = len(key)
        self.rows = []

    def add_row(self,row:List[str]) -> None:
        """Adds row to self.rows dependant on certain conditions

        Args:
            row (List[str]): A List[str] representing a row from a csv file

        Raises:
            ValueError: If exceeds full capacity of combination 
                        (indicates presence of duplicate lines)
        """
        if self.is_full_cap():
            raise ValueError("flow must not exceed capacity")
        if self.combo_allows_row(row) and row not in self.rows:
            self.rows.append(row)
            self.__increment_flow()

    def __increment_flow(self) -> None: # 'Private' Method
        self.flow += 1

    def combo_allows_row(self, row: List[str]) -> bool:
        """Check if combination allows a row. Combination can only rows that match it's key

        Args:
            row (List[str]): Represents a row from a csv file
        """
        if not len(row) == self.length:
            raise ValueError(f"row length ({len(row)}) must \
                             be same combination length ({self.length})")

        for ind,val in enumerate(row):
            if val not in self.key[ind]:
                return False
        return True

    def is_full_cap(self) -> bool:
        """Checks capacity"""
        return self.capacity == self.flow
