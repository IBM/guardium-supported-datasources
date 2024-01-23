import json
import csv
from constants import FEATURE_KEY,GUARDIUM_VERSIONS

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