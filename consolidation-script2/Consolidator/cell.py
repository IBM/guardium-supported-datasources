"""_summary_
"""
from typing import List
import dataclasses
from .column_helper import ColumnHelper

@dataclasses.dataclass
class Cell:
    """Describes a single cell from data matrix
    """
    value: List[str]
    column_helper:ColumnHelper
    def __init__(self,value: List[str], column_helper:ColumnHelper) -> None:
        self.value = [value]
        self.column_helper = column_helper
        