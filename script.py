import yaml
import csv
from distutils.version import LooseVersion
import copy
import json

# Constants
FEATURE_KEY=["Network traffic","Local traffic","Encrypted traffic","Shared Memory","Kerberos","Blocking","Redaction","UID Chain","Compression","Query Rewrite","Instance Discovery","Protocol"]
GUARDIUM_VERSIONS=["11","11.1","11.2","11.3","11.4"]

# Extracts numbers from a list of strings (representing different versions) and returns sorted
# Example: getRange(["MongoDB 3.2,MongoDB 4.224,MongoDB 4.3.2,MongoDB 5.3.2,MongoDB 3.5.2,"],"MongoDB") = 3.2,4.224,4.3.2,5.3.2,3.5.2
def getRange(dbvs,dbName):
    REMOVE_LIST = [(",","+")]
    dbvRet = []
    for dbv in dbvs:
        dbvStr = dbv.replace(dbName,"").strip()
        for item in REMOVE_LIST:
            dbvStr = dbvStr.replace(item[0],item[1]).strip()
        
        dbvRet.append(dbvStr)
    
    dbvRet = [ x+"987654321" if (str.isalpha(x) or x=='') else x for x in dbvRet ]
    # print(f"dbvRet:{dbvRet}" )
    dbvRet = sorted(dbvRet, key=LooseVersion)
    dbvRet = [ x.replace("987654321","") for x in dbvRet ]
    ret = ", ".join(dbvRet)
    
    return ret


def GetFullOSDictForGVDB(gvToMatch,dbToMatch):
    # Keep Dict of all OS/OS versions for a given GV and DB
    fullOSDictForGVDBInitial = {}
    
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs_clean.csv") as f:
        reader = csv.DictReader(f)
        # Iterate through each row 
        for row in reader:
        
            rowDB = row["Database/DBaaS"].strip()
            rowGV = row["Guardium Version"].strip()

            # Continue only if row's database name and guardium version match
            if rowGV == gvToMatch and rowDB==dbToMatch:
                
                # Initialize all version information for this row
                rowOS = row["OS/Platform"].strip()
                rowDBV = row["Database/DBaaS version"].strip()
                rowOSV = row["OS/Platform version"].strip().replace("-","")
                
                # Check if row's os does not have a prev key
                if rowOS not in fullOSDictForGVDBInitial:
                    fullOSDictForGVDBInitial[rowOS] = []
                    
                if rowOSV not in fullOSDictForGVDBInitial[rowOS]:
                    fullOSDictForGVDBInitial[rowOS].append(rowOSV)
                    
        
    fullOSDictForGVDBFinal = copy.deepcopy(fullOSDictForGVDBInitial)
    for os in fullOSDictForGVDBFinal:
        if len(fullOSDictForGVDBInitial[os]) > 1:
            fullOSDictForGVDBFinal[os] = getRange(fullOSDictForGVDBInitial[os],os)
        
    return fullOSDictForGVDBFinal
                


# Returns consolidated feature information for a given (DB, GUARDIUM_VERSION)
# Structure Returned:
'''
{
{
    DBNAME: {
        FEATUREKEY[0]: {
            LISTOFDBVERSIONS(string): {
                OSNAME[0]: {
                   LISTOFOSVERSIONS(string) 
                }
                
                
            }
        }
    }
}
}

'''
# Example: 
'''
{
   {'MongoDB': {
       'K-TAP | K-TAP | A-TAP |  |  | K-TAP, A-TAP (A-TAP with Linux 2.6.36 and higher only) | K-TAP | K-TAP, A-TAP (A-TAP only when configured for real IPs) | K-TAP |  |  | N/A | ':
            {'3.2,3.4,3.6,4,4.1,4.2':
                {'Red Hat': '6,7,7.1,7.2,7.3,7.4,7.5,7.6,7.7,7.8,7.9,8', 'Suse': '11-,,12-,15-', 'CentOS': '6x,7x'}}, 
   
        ' | S-TAP |  | N/A |  | S-TAP | S-TAP | N/A | N/A |  | S-TAP | TCP, NMP | ':
            {'3.2,3.4': 
                {'Windows Server': '2012,2012R2,2016,2019'}}, 
        
        ' | S-TAP |  | N/A |  | S-TAP | S-TAP | N/A | N/A |  | S-TAP | TCP | ': 
            {'3.6,4,4.1,4.2': 
            {'Windows Server': '2012,2012R2,2016,2019'}
    }}
'''    
def getJSONForGVDB(gvToMatch,dbToMatch):
    initialJSON = {}
    initialJSON[dbToMatch] = {}
    finalJSON = {}
    
    
    

    
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs_clean.csv") as f:
        reader = csv.DictReader(f)
        # Iterate through each row 
        for row in reader:
        
            rowDB = row["Database/DBaaS"].strip()
            rowGV = row["Guardium Version"].strip()

            # Continue only if row's database name and guardium version match
            if rowGV == gvToMatch and rowDB==dbToMatch:
                
                # Initialize all version information for this row
                rowOS = row["OS/Platform"].strip()
                rowDBV = row["Database/DBaaS version"].strip()
                rowOSV = row["OS/Platform version"].strip().replace("-","")
                
            
        
                # Create row feature information string (eg. 'K-TAP | K-TAP | A-TAP |  |  | K-TAP, A-TAP (A-TAP with Linux 2.6.36 and higher only) | K-TAP | K-TAP, A-TAP (A-TAP only when configured for real IPs) | K-TAP |  |  | N/A | ')
                rowFeatureInfo = ""
                for key in FEATURE_KEY:
                    rowFeatureInfo += f'{row[key].strip()} | '

                # Check if row's featureinfo does not have a prev key
                if rowFeatureInfo not in initialJSON[rowDB]:
                    initialJSON[rowDB][rowFeatureInfo] = {}

                # Check if row's os does not have a prev key
                if rowOS not in initialJSON[rowDB][rowFeatureInfo]:
                    initialJSON[rowDB][rowFeatureInfo][rowOS] = {}
                
                # Check if row's os version does not have a prev key
                if rowOSV not in initialJSON[rowDB][rowFeatureInfo][rowOS]:
                    initialJSON[rowDB][rowFeatureInfo][rowOS][rowOSV] = []

                # Check if row's db version is not in list
                if rowDBV not in initialJSON[rowDB][rowFeatureInfo][rowOS][rowOSV]:
                    initialJSON[rowDB][rowFeatureInfo][rowOS][rowOSV].append(rowDBV)

                
                # Turn list of db versions into a comma seperated string depicting sorted dbversions
                initialJSONCopy = copy.deepcopy(initialJSON)
                for dbName in initialJSONCopy:
                    for featureInfo in initialJSONCopy[dbName]:
                        for os in initialJSONCopy[dbName][featureInfo]:
                            for osv in initialJSONCopy[dbName][featureInfo][os]:
                                initialJSONCopy[dbName][featureInfo][os][osv] = getRange(initialJSON[dbName][featureInfo][os][osv],dbName)
                                
                
                # Reverse Hierarchy from (DBNAME -> COMBO -> OS -> OSV -> DBV) to (DBNAME -> COMBO -> DBV -> OS -> OSV)
                finalJSON = {}
                for dbName in initialJSONCopy:
                    
                    # Just repopulate initial hierarchy
                    if dbName not in finalJSON:
                        finalJSON[dbName] = {}
                    for featureInfo in initialJSONCopy[dbName]:
                        if featureInfo not in finalJSON[dbName]:
                            finalJSON[dbName][featureInfo] = {}
                            
                        # Iterate thru each OSV for a particular featureInfo
                        for os in initialJSONCopy[dbName][featureInfo]:
                            for osv in initialJSONCopy[dbName][featureInfo][os]:
                                
                                # Create key for a unique DBVersion string
                                dbvStr = initialJSONCopy[dbName][featureInfo][os][osv]
                                if dbvStr not in finalJSON[dbName][featureInfo]:
                                    finalJSON[dbName][featureInfo][dbvStr] = {}
                                    
                                # Create key for a unique/new OS under DB version string
                                if os not in finalJSON[dbName][featureInfo][dbvStr]:
                                    finalJSON[dbName][featureInfo][dbvStr][os] = []
                                    
                                # Append unique/new OS version to a list under its OS
                                if osv not in finalJSON[dbName][featureInfo][dbvStr][os]:
                                    finalJSON[dbName][featureInfo][dbvStr][os].append(osv)
                                    
                        # Turn list of os versions into a comma seperated string depicting sorted os versions
                        for dbvStr in finalJSON[dbName][featureInfo]:
                            for os in finalJSON[dbName][featureInfo][dbvStr]:
                                finalJSON[dbName][featureInfo][dbvStr][os] = getRange(finalJSON[dbName][featureInfo][dbvStr][os],os)
                                
                                
    # if finalJSON == {}: #?                   
    return finalJSON

# Create ComboDict for all DBs for all Guardium Versions
def GetFullJSON(testing=False):
    fullJSON = {}
    
    # Get list of allDBs
    allDBs = []
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs_clean.csv") as f:
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

def getComboFromGeneratedJSON(filepath,db,os,dbv,osv,gv):
    f = open(filepath)
    data = json.load(f)
    
    REMOVE_LIST = [(",","+"),(db,""),(os,"")]
    

    for item in REMOVE_LIST:
        dbv = dbv.replace(item[0],item[1]).strip()
        osv = osv.replace(item[0],item[1]).strip()
        

    dbData = data[db]
    ans = []
    for combo in dbData:
        if gv not in combo["GUARDIUM_VERSION"].split(","):
            continue
        
        if dbv not in combo["DB_VERSIONS"].split(","):
            continue
        
        
        
            
        jsonOSVs = combo["OS_VERSIONS"]
        correct = False
        for jsonOSV in jsonOSVs:
            jsonOSV = jsonOSV.replace("(","")
            jsonOSV = jsonOSV.replace(")","")
            jsonOSName = jsonOSV.split(":")[0]
            
            jsonOSVersionNumber = jsonOSV.split(":")[1].strip().split(",")
            
            if os in jsonOSName and osv  in jsonOSVersionNumber:
                correct = True
        
        if not correct: continue
            
        
        rowCombo = ""
        for key in FEATURE_KEY:
            rowCombo += f'{combo[key]} | '
        
        ans.append(rowCombo)
    
    return ans[0]
        
        
            
        

    
                

def testCorrectness(filePathCSV,filePathJSON):
    failDBList = []
    success = 0
    fail = 0
    
    # Loop thru each row
    with open(filePathCSV) as f:
        reader = csv.DictReader(f)
        for row in reader:
            rowCombo = ""
            for key in FEATURE_KEY:
                rowCombo += f'{row[key].strip()} | '

            rowDB = row["Database/DBaaS"].strip()
            rowOS = row["OS/Platform"].strip()
            rowDBV = row["Database/DBaaS version"].strip()
            rowOSV = row["OS/Platform version"].strip()
            rowGV = row["Guardium Version"].strip()
        
            try:
                assert(getComboFromGeneratedJSON(filePathJSON,rowDB,rowOS,rowDBV,rowOSV,rowGV) == rowCombo)
                success += 1
                # print(f"PASS:{rowOSV,rowDBV}  {rowDB,rowOS,rowGV}")
                    
            except:
                # print(f"FAILTURE:{rowOSV,rowDBV}  {rowDB,rowOS,rowGV}")
                # print(f"GETCOMBO: {getComboFromGeneratedJSON(rowDB,rowOS,rowDBV,rowOSV,rowGV)}")
                # print(f"ROWCOMBO: {rowCombo}")
                # print("")
                # print("")
                if rowDB not in failDBList: failDBList.append(rowDB)
                
                fail += 1
                
            
    print(f"TOTAL:{success + fail} \n Fail:{fail}")
    print(f'List of failing DBS: {failDBList}')
            
def getListOfDBVs(dbName):
    dbvs = []
    
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs_clean.csv") as f:
        reader = csv.DictReader(f)
        # Iterate through each row 
        for row in reader:
            
            if row["Database/DBaaS"].strip() == dbName:
                if row["Database/DBaaS version"].strip() not in dbvs:
                    dbvs.append(row["Database/DBaaS version"].strip())
                    
    dbvsString = getRange(dbvs,dbName)
    return dbvsString
            
    
    
file=open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.json","w")
json.dump(makeReadable(bigComboDict=GetFullJSON(testing=False)),file, indent=4, sort_keys=True)
file.close()
print("YAML file saved.")

