from distutils.version import LooseVersion
import copy
import csv
from constants import FEATURE_KEY,JSON_FILE_PATH,CSV_FILE_PATH


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

    with open(CSV_FILE_PATH) as f:
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

# For a given DB and GV, 
def GetFullOSDictForGVDB(gvToMatch,dbToMatch):
    # Keep Dict of all OS/OS versions for a given GV and DB
    fullOSDictForGVDBInitial = {}
    
    with open(CSV_FILE_PATH) as f:
        reader = csv.DictReader(f)
        # Iterate through each row 
        for row in reader:
        
            rowDB = row["Database/DBaaS"].strip()
            rowGV = row["Guardium Version"].strip()

            # Continue only if row's database name and guardium version match
            if rowGV == gvToMatch and rowDB==dbToMatch:
                
                # Initialize all OS information for this row
                rowOS = row["OS/Platform"].strip()
                rowOSV = row["OS/Platform version"].strip().replace("-","")
                
                # Check if row's os does not have a prev key
                if rowOS not in fullOSDictForGVDBInitial:
                    fullOSDictForGVDBInitial[rowOS] = []
                    
                if rowOSV not in fullOSDictForGVDBInitial[rowOS]:
                    fullOSDictForGVDBInitial[rowOS].append(rowOSV)
                    
    # Turn list of OS Versions into a single range
    fullOSDictForGVDBFinal = copy.deepcopy(fullOSDictForGVDBInitial)
    for os in fullOSDictForGVDBFinal:
        if len(fullOSDictForGVDBInitial[os]) > 1:
            fullOSDictForGVDBFinal[os] = getRange(fullOSDictForGVDBInitial[os],os)
        
    return fullOSDictForGVDBFinal



def getListOfDBVs(dbName):
    dbvs = []
    
    with open(CSV_FILE_PATH) as f:
        reader = csv.DictReader(f)
        # Iterate through each row 
        for row in reader:
            
            if row["Database/DBaaS"].strip() == dbName:
                if row["Database/DBaaS version"].strip() not in dbvs:
                    dbvs.append(row["Database/DBaaS version"].strip())
                    
    dbvsString = getRange(dbvs,dbName)
    return dbvsString