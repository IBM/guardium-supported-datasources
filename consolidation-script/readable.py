from helpers import getListOfDBVs
from constants import FEATURE_KEY

# Convert bigComboDict to readable yaml
def makeReadable(bigComboDict):
    readableDict = {}
    
    for db in bigComboDict:
        readableDict[db] = []
        count = 0
        for gv in bigComboDict[db]:
            for combo in bigComboDict[db][gv]:
                for dbv in bigComboDict[db][gv][combo]:
                    osStringFull = []
                    for os in bigComboDict[db][gv][combo][dbv]:
                        osString = f'{os}: {bigComboDict[db][gv][combo][dbv][os].replace("thirtytwobit","32bit").replace(" sixtyfourbit","64bit").replace("sixtyfourbit","64bit")}'
                        osStringFull.append(osString)
                    
                    dictToAppend = {}
                    dictToAppend["id"] = count
                    
                    dictToAppend["OS_VERSIONS"] = osStringFull
                    
                    gvStr = gv
                    if gv in "11, 11.1, 11.2, 11.3, 11.4, 11.5" and "," in gv:
                        gvStr = f'{gv.split(",")[0].strip()}-{gv.split(",")[-1].strip()}'
                    dictToAppend["GUARDIUM_VERSION"] = gvStr
                    
                    
                    dbvStr = dbv
                    if dbv in getListOfDBVs(db) and "," in dbv:
                        dbvStr = f'{dbv.split(",")[0].strip()}-{dbv.split(",")[-1].strip()}'
                    dictToAppend["DB_VERSIONS"] = dbvStr
                    
                    comboArr = combo.split("|")
                    for i,key in enumerate(FEATURE_KEY):
                        dictToAppend[key] = comboArr[i].strip()
                        
                        
                    
                    readableDict[db].append(dictToAppend)
                    count += 1
                     
    return readableDict

# Convert bigComboDict to readable yaml
def writeReadableYAML2(bigComboDict):
    yamlDict = {}
    
    for db in bigComboDict:
        yamlDict[db] = []
        count = 0
        for gv in bigComboDict[db]:
            for combo in bigComboDict[db][gv]:
                for dbv in bigComboDict[db][gv][combo]:
                    osStringFull = []
                    for os in bigComboDict[db][gv][combo][dbv]:
                        osString = f'{os}: ({bigComboDict[db][gv][combo][dbv][os]}) \n'
                        osStringFull.append(osString)
                    
                    dictToAppend = {}
                    dictToAppend["id"] = count
                    dictToAppend["FEATURE_KEY"] = combo
                    dictToAppend["GUARDIUM_VERSION"] = gv
                    dictToAppend["DB_VERSIONS"] = dbv
                    dictToAppend["OS_VERSIONS"] = osStringFull
                    
                    # comboArr = combo.split("|")
                    # for i,key in enumerate(FEATURE_KEY):
                    #     dictToAppend[key] = comboArr[i].strip()
                        
                        
                    
                    yamlDict[db].append(dictToAppend)
                    count += 1
                     
    return yamlDict