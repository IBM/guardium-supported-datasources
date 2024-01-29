"""_summary_
"""
from typing import List
import dataclasses
from .cell import Cell
from .column_helper import ColumnHelper

@dataclasses.dataclass
class Row:
    """_summary_
    """
    compat_info: List[Cell]

    def __init__(self,data:List[str],feature_info:str
                 ,column_helpers:List[ColumnHelper]) -> None:
        # TODO: Validate
        self.og_data = data
        self.column_helpers = column_helpers
        self.feature_info = feature_info

        # Must ensure data is in order (i.e compat keys first)
        self.compat_info = self.contstruct_compat_info(column_helpers)
        
        
    
    def validate(self):
        pass

    def get_value_for_key(self,key:str) -> List[str]:
        for i,cell in enumerate(self.compat_info):
            if cell.column_helper.header == key: 
                return cell.value
    
    def get_full_value_minus_key(self,key) -> str:
        ans = []
        for i,cell in enumerate(self.compat_info):
            if cell.column_helper.header != key:
                ans.append(str(cell.value))
        return str(ans)
        

    def contstruct_compat_info(self, column_helpers: List[ColumnHelper]) -> List[Cell]:
        """_summary_

        Args:
            column_helpers (List[ColumnHelper]): _description_

        Returns:
            List[Cell]: _description_
        """
        compat_info = []
        for i,x in enumerate(self.og_data[:len(self.column_helpers)]):
            compat_info.append(Cell(x,column_helpers[i]))
        return compat_info