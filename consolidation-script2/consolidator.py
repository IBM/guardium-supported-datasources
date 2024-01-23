# TODO: Write the consolidation-script in a manner that it will work with different CSV's with different headers
class Consolidator:
    def __init__(self,data,compatibility_keys,feature_keys) -> None:
        # TODO: Some kind of check on data, to make sure the keys are as we expect
        # TODO: Construct list of Row objects?
        
        pass
    
    def consolidate(self):
        pass
    
    
class Row:
    def __init__(self,data,compatibility_keys,feature_keys) -> None:
        pass
    
    def get_feature_info(self) -> str:
        pass
    
    def get_compatibility_info(self):
        pass