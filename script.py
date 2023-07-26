import yaml
import csv
from distutils.version import LooseVersion
import copy
import json

# Constants
FEATURE_KEY=["Network traffic","Local traffic","Encrypted traffic","Shared Memory","Kerberos","Blocking","Redaction","UID Chain","Compression","Query Rewrite","Instance Discovery","Protocol"]
GUARDIUM_VERSIONS=["11.0","11.1","11.2","11.3","11.4"]

# Extracts numbers from a list of strings (representing different versions) and returns sorted
# Example: getRange(["MongoDB 3.2,MongoDB 4.224,MongoDB 4.3.2,MongoDB 5.3.2,MongoDB 3.5.2,"],"MongoDB") = 3.2,4.224,4.3.2,5.3.2,3.5.2
def getRange(dbvs,dbName):
    REMOVE_LIST = [("64-bit","sixtyfourbit"),("32-bit","thirtytwobit"),(",","+"),(dbName,"")]
    dbvRet = []
    for dbv in dbvs:
        dbvStr = dbv.replace(dbName,"").strip()
        for item in REMOVE_LIST:
            dbvStr = dbvStr.replace(item[0],item[1]).strip()
        
        dbvRet.append(dbvStr)
    
    dbvRet.sort(key=LooseVersion)
    ret = ",".join(dbvRet)
    
    return ret

# Returns consolidated feature information for a given DB for a given Guardium Version
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
def getComboDict(gv,db):
    comboDict = {}
    comboDict2 = {}

    # Iterate through each row
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.csv") as f:
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

            if rowGV == gv and rowDB==db:
                
                if rowDB not in comboDict:
                    comboDict[rowDB] = {}
                
                if rowCombo not in comboDict[rowDB]:
                    comboDict[rowDB][rowCombo] = {}

                if rowOS not in comboDict[rowDB][rowCombo]:
                    comboDict[rowDB][rowCombo][rowOS] = {}
                    
                if rowOSV not in comboDict[rowDB][rowCombo][rowOS]:
                    comboDict[rowDB][rowCombo][rowOS][rowOSV] = []

                if rowDBV not in comboDict[rowDB][rowCombo][rowOS][rowOSV]:
                    comboDict[rowDB][rowCombo][rowOS][rowOSV].append(rowDBV)

                
                # Turn into range
                comboDict1 = copy.deepcopy(comboDict)
                for db in comboDict1:
                    for combo in comboDict1[db]:
                        for os in comboDict1[db][combo]:
                            for osv in comboDict1[db][combo][os]:
                                comboDict1[db][combo][os][osv] = getRange(comboDict[db][combo][os][osv],db)
                                
                
                # Reverse
                comboDict2 = {}
                for db in comboDict1:
                    if db not in comboDict2:
                        comboDict2[db] = {}
                    for combo in comboDict1[db]:
                        if combo not in comboDict2[db]:
                            comboDict2[db][combo] = {}
                        for os in comboDict1[db][combo]:
                            for osv in comboDict1[db][combo][os]:
                                dbvStr = comboDict1[db][combo][os][osv]
                                if dbvStr not in comboDict2[db][combo]:
                                    comboDict2[db][combo][dbvStr] = {}
                                    
                                if os not in comboDict2[db][combo][dbvStr]:
                                    comboDict2[db][combo][dbvStr][os] = []
                                    
                                if osv not in comboDict2[db][combo][dbvStr][os]:
                                    comboDict2[db][combo][dbvStr][os].append(osv)
                        # Convert to range
                        for dbvStr in comboDict2[db][combo]:
                            for os in comboDict2[db][combo][dbvStr]:
                                comboDict2[db][combo][dbvStr][os] = getRange(comboDict2[db][combo][dbvStr][os],os)
                                
                                
                                
    return comboDict2

# Create ComboDict for all DBs for all Guardium Versions
def bigComboDict():
    bigComboDict = {}
    allDBs = []
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rowDB = row["Database/DBaaS"]
            if rowDB not in allDBs:
                allDBs.append(rowDB)
    for db in allDBs:
        
        
        bigComboDict[db] = {}
        sameDict = {}
        # Consolidate if feature information is same for different guardium versions
        try:
            for i,gv in enumerate(GUARDIUM_VERSIONS):
                breakIt = False
                for key in sameDict:
                    if gv in sameDict[key]:
                        breakIt = True
                        continue
                    
                if breakIt: continue
                sameDict[gv] = [gv]
                
                
                for j,gv2 in enumerate(GUARDIUM_VERSIONS[i+1:]):
                    if getComboDict(gv,db) == getComboDict(gv2,db):
                        sameDict[gv].append(gv2)
            
            
            sameDict2 = {}
            
            for gv in sameDict:
                if len(sameDict[gv]) > 1:
                    sameDict2[gv] = sameDict[gv]
            
            for gv in sameDict:
                bigComboDict[db][",".join(sameDict[gv])] = getComboDict(gv,db)[db]
                    
        except:
            print(f"FAILED: {db}")
    
    return bigComboDict
            
# Convert bigComboDict to readable yaml
def writeReadableYAML(bigComboDict):
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
                    # dictToAppend["FEATURE_KEY"] = combo
                    dictToAppend["GUARDIUM_VERSION"] = gv
                    dictToAppend["DB_VERSIONS"] = dbv
                    dictToAppend["OS_VERSIONS"] = osStringFull
                    
                    comboArr = combo.split("|")
                    for i,key in enumerate(FEATURE_KEY):
                        dictToAppend[key] = comboArr[i].strip()
                        
                        
                    
                    yamlDict[db].append(dictToAppend)
                    count += 1
                     
    return yamlDict

def getCombo(db,os,dbv,osv,gv):
    f = open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.json")
    data = json.load(f)
    
    REMOVE_LIST = [("64-bit","sixtyfourbit"),("32-bit","thirtytwobit"),(",","+"),(db,""),(os,"")]
    

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
            jsonOSName = jsonOSV.split(":")[0]
            
            jsonOSVersionNumber = jsonOSV.split(":")[1].strip().split(",")
            
            if os in jsonOSName and osv  in jsonOSVersionNumber:
                correct = True
        
        if not correct: continue
            
        rowCombo = ""
        for key in FEATURE_KEY:
            rowCombo += f'{combo[key]} | '
        
        ans.append(rowCombo)
    
    if len(ans) == 1:
        return ans[0]
    return ans
        
        
            
        

    
                

def testCorrectness():
    failureDict = {}
    success = 0
    fail = 0
    with open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.csv") as f:
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
                assert(getCombo(rowDB,rowOS,rowDBV,rowOSV,rowGV) == rowCombo)
                success += 1
            except:
                if rowDB not in ["CockroachDB","Couch","DynamoDB","Elasticsearch","HDFS","Hortonworks","Oracle Exadata","Oracle RAC","PostgreSQL","Redis","Snowflake","Sybase ASE","Db2 Purescale","S3"]:
                    print(f"FAILTURE:{rowOSV,rowDBV}  {rowDB,rowOS,rowGV}")
                    print(f"GETCOMBO: {getCombo(rowDB,rowOS,rowDBV,rowOSV,rowGV)}")
                    print(f"ROWCOMBO: {rowCombo}")
                    print("")
                    print("")
                    fail += 1
                
            
    print(f"TOTAL:{success + fail} \n Fail:{fail}")
            
    
    
# print(bigComboDict()["MongoDB"])
# print("DONZO")
# print(getComboDict("11.0","MongoDB")["MongoDB"])

# for x in writeReadableYAML(bigComboDict=bigComboDict())["MongoDB"]:
#     print(x)
#     print("")

file=open("/Users/ahmedmujtaba/Desktop/workspace/github.ibm.com/IBM/guardium-supported-datasources/supported_dbs.json","w")
json.dump(writeReadableYAML(bigComboDict=bigComboDict()),file, indent=4, sort_keys=True)
file.close()
print("YAML file saved.")

# print(getRange(["MongoDB 3.2,MongoDB 4.224,MongoDB 4.3.2,MongoDB 5.3.2,MongoDB 3.5.2,"],"MongoDB"))
# print(getComboDict("11.1","MongoDB"))
# print(getCombo("MongoDB","Windows Server","MongoDB 4.2","Windows Server 2012 R2","11.0"))
testCorrectness()

# for gv in "16.1".split(","):
#     print(gv)

# print(getCombo("Teradata","Suse","Teradata 17.0",'Suse 11 - 32-bit, 64-bit',"11.4"))