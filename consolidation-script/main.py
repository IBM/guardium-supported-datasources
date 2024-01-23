import csv
import copy
import json
from helpers import getRange,getJSONForGVDB,GetFullOSDictForGVDB,getListOfDBVs
from constants import FEATURE_KEY,GUARDIUM_VERSIONS,CSV_FILE_PATH,JSON_FILE_PATH
from testing import getComboFromGeneratedJSON, testCorrectness
from readable import makeReadable, writeReadableYAML2


# Create ComboDict for all DBs for all Guardium Versions
def GetFullJSON(testing=False):
    fullJSON = {}
    
    # Get list of allDBs
    allDBs = []
    with open(CSV_FILE_PATH) as f:
        reader = csv.DictReader(f)
        for row in reader:
            rowDB = row["Database/DBaaS"]
            if rowDB not in allDBs:
                allDBs.append(rowDB)
                
                
    #Iterate thru list of all DBs
    for db in allDBs:
        
        fullJSON[db] = {}
        
        
        # Consolidate if feature information for a DB is exact same for different guardium versions
        
        sameGVDict = {}
        # Iterate thru list of all Guardium Versions
        for i,gv in enumerate(GUARDIUM_VERSIONS):
    
            if getJSONForGVDB(gv,db) == {}:
                # No DB Support for this Guardium Version
                continue
            
            
            breakIt = False
            for key in sameGVDict:
                if gv in sameGVDict[key]: # Feature Information for current Guardium Version is same as a prev Guardium Version
                    breakIt = True
                    continue
                
            if breakIt: continue
            sameGVDict[gv] = [gv] # Set Feature Information for current Guardium Version is same as current Guardium Version
            
            
            # Loop thru all remaining Guardium Versions (gb)
            for j,gv2 in enumerate(GUARDIUM_VERSIONS[i+1:]):
        
                if getJSONForGVDB(gv,db) == getJSONForGVDB(gv2,db):
                    sameGVDict[gv].append(gv2)
        
        
        # sameDict2 = {}
        
        # for gv in sameGVDict:
        #     if len(sameGVDict[gv]) > 1:
        #         sameDict2[gv] = sameGVDict[gv]
        
        for gv in sameGVDict:
            JSONForGVDB = getJSONForGVDB(gv,db)[db]
            JSONForGVDBCopy = copy.deepcopy(JSONForGVDB)
            if testing == False:
                fullOSDict = GetFullOSDictForGVDB(gv,db)
                for featureInfo in JSONForGVDBCopy:
                    for dbv in JSONForGVDBCopy[featureInfo]:
                        for os in JSONForGVDBCopy[featureInfo][dbv]:
                            osvString = JSONForGVDBCopy[featureInfo][dbv][os]
                            if osvString in fullOSDict[os] and "," in osvString:
                                JSONForGVDBCopy[featureInfo][dbv][os] = f'{osvString.split(",")[0]}-{osvString.split(",")[-1].strip()}'
            fullJSON[db][", ".join(sameGVDict[gv])] = JSONForGVDBCopy
            
        # except:
        #     print(f"FAILED: {db}")
        #     #THROWERROR
    
    return fullJSON
            



            
    
    
file=open(JSON_FILE_PATH,"w")
json.dump(makeReadable(bigComboDict=GetFullJSON(testing=False)),file, indent=4, sort_keys=True)
file.close()
print("JSON file saved.")

