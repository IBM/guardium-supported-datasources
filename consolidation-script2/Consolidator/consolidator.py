"""_summary_

Raises:
    ValueError: _description_
    ValueError: _description_
"""
from typing import List
import dataclasses
from .column_helper import ColumnHelper
from .row import Row
from .cell import Cell




@dataclasses.dataclass
class Consolidator:
    """TODO: Write the consolidation-script in a manner 
    that it will work with different CSV's with different headers"""
    og_data_matrix: List[List[str]]
    column_helpers: List[ColumnHelper]
    data: List[Row]

    def __init__(self,
                 data_matrix: List[List[str]],
                 column_helpers: List[ColumnHelper],
                 feature_keys: List[str]) -> None:

        self.validate_data_matrix(data_matrix,[x.header for x in column_helpers],feature_keys)
        self.og_data_matrix = data_matrix
        self.column_helpers = column_helpers

        # Construct Column Helpers
        
        self.data = [Row(x,str(x[len(column_helpers):]),column_helpers) for x in data_matrix]
        
        

        pass

    def validate_data_matrix(self,data_matrix :List[List[str]],
                            compatibility_keys:List[str],feature_keys:List[str]):
        """Ensure DataMatrix has expected size and dimensions

        Args:
            dataMatrix (_type_): _description_

        Raises:
            ValueError: _description_
            ValueError: _description_
        """
        if not data_matrix:
            raise ValueError("The list is empty.")

        
        #Check length restrictions on data_matrix
        reference_length = len(compatibility_keys) + len(feature_keys)
        for sublist in data_matrix:
            if len(sublist) != reference_length:
                print(sublist)
                raise ValueError(f"Sublists have different lengths. {len(sublist)} != {reference_length}")
            
        # TODO: Check header of data_matrix  is as expected
        # TODO: 
    
    def constuct_data(self) -> [Row]:
        """_summary_

        Returns:
            [Row]: _description_
        """
        rows = []
        for i in self.og_data_matrix[1:]: #Skip the headers
            row = []
            for j,x in enumerate(i[:len(self.column_helpers)]): #Skip the feature cells
                row.append(Cell([i[j]],x))
            rows.append(row)
            
            
        
        

    def consolidate(self):
        pass