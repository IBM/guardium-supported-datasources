import time
import os
import csv

def replace_string_in_csv_files(x,directory_path, old_strings, new_strings):
    
    
    
    count = 0
    for filename in x:
        # for filename in os.listdir(directory_path):
        if filename.endswith('.csv') and filename != "consolidation-script2/data/input/supported_dbs_mongo.csv" and filename != "/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/consolidation-script2/data/input/OnPrem_Stap.csv":
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r', newline='') as file:
                csv_reader = csv.reader(file)
                rows = list(csv_reader)
            
            out_file_path = file_path.replace(".csv","2.csv")
            print(out_file_path)
            

            
            with open(out_file_path, 'w', newline='') as file:
                csv_writer = csv.writer(file)
                header = True
                
                for row in rows:
                    new_row = row
                    
                    for a,b in list(zip(old_strings,new_strings)):
                        new_row = [cell if cell != a else b for cell in new_row]
                    
                    if header != True:
                        print(f"we here:{row}")
                        if "GDP" in new_row[0] or "GDP" in new_row[1]:
                            print(f"we here: {new_row}")
                            new_row.insert(0,"GDP")
                        elif "GI" in new_row[0] or "GI" in new_row[1]:
                            print(f"we here2: {new_row}")
                            new_row.insert(0,"GI")
                    
                    if header == True:
                        header = False
                    
                
                        
                    
                    
                    
                    
                    csv_writer.writerow(new_row)
                
            if count == 20: break
                
                
                    

# Example usage:
x = ['IBMCloud_ExStap.csv', 'Azure_ExStap.csv', 'Azure_UC.csv', 'AWS_ExStap.csv', 'OracleCloud_ExStap.csv', 'GCP_ExStap.csv', 'GCP_UC.csv', 'supported_dbs_mongo.csv', 'Azure_AzEvHub.csv', 'GI_OnPrem.csv', 'AWS_UC.csv', 'AWS_AmKin.csv', 'IBMCloud_UC.csv']
directory_path = '/Users/ahmedmujtaba/Desktop/workspace/guardium-supported-datasources-v2/consolidation-script2/data/input'
old_strings = ['11.3.0','11.4.0','11.5.0','12.0.0','3.2.0','3.2.6','3.3.0','3.3.0(planned)','saas']
new_strings = ['GDP 11.3.0','GDP 11.4.0','GDP 11.5.0','GDP 12.0.0','GI 3.2.0','GI 3.2.6','GI 3.3.0','GI 3.3.0(planned)','GI saas']


replace_string_in_csv_files(x,directory_path, old_strings,new_strings)