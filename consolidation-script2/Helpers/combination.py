from itertools import product
from typing import List, Any
from .helpers import product_of_lengths
import dataclasses

@dataclasses.dataclass
class Combination:
    """xwww
    Represents a possible combination of elements from multiple lists.

    Args:
        keys (List[List[str]]): A list of lists of strings representing the elements to combine.

    Attributes:
        keys (List[List[str]]): A list of lists of strings representing the elements to combine.
        combinations (List[Tuple[Any, ...]]): List of tuples representing all possible combinations.

    Raises:
        TypeError: If keys is not a list of lists of strings.
    """
    length: int
    key: List[List[str]]
    capacity: int
    flow: int
    rows: List[List[str]]

    def __init__(self, key: List[List[str]]) -> None:
        if not isinstance(key, list) or not all(isinstance(lst, list) and all(isinstance(item, str) for item in lst) for lst in key):
            #TODO: check elem in key doesn't contain duplicates
            raise TypeError(f"keys must be a list of lists of strings, instead we got:{key}")
        self.key = key
        self.capacity = product_of_lengths(key)
        self.flow = 0
        self.length = len(key)
        self.rows = []
        
    def add_row(self,row:List[str]) -> None:
        if self.combo_allows_row(row) and row not in self.rows:
            self.rows.append(row)
            self.increment_flow()
        
    def increment_flow(self) -> None:
        self.flow += 1
        
    def combo_allows_row(self, row: List[str]) -> bool:
        if not len(row) == self.length:
            raise ValueError(f"row length ({len(row)}) must be same combination length ({self.length})")

        for ind,val in enumerate(row):
            if val not in self.key[ind]:
                return False
        return True
    
    def is_full_cap(self) -> bool:
        return self.capacity == self.flow
        
        

