"""_summary_
"""
from typing import Callable
import dataclasses

@dataclasses.dataclass
class ColumnHelper:
    """Describes helper function related to a column from data matrix
    """
    header:str
    def __init__(self,name:str, compare_key: Callable[[str], str],
                 clean_function:Callable[[str], str]) -> None:
        self.header = name
        self.compare_key = compare_key
        self.clean_function = clean_function
        