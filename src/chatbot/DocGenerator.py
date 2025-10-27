#!/usr/bin/env python3
"""
Document Generator for Guardium Supported Datasources
This script reads JSON data and generates documentation in the specified format.
"""

from pydoc import doc
from re import sub
from typing import Any
from enum import Enum

import json
import os
from pathlib import Path
from xxlimited import Str

from numpy import single
from numpy.random import f
from ReadJSON import read_json_file
import re
from config import DOC_DIR,JSON_DIR
data=[]
  

def ensure_directory_exists(directory_path):
    """Create directory if it doesn't exist"""
    Path(directory_path).mkdir(parents=True, exist_ok=True)
def stapmain():
    print("STAP Document generation")
    input_file = "{JSON_DIR}/OnPrem_Stap.json"
    output_dir = DOC_DIR
    output_filename = "OnPrem_STAP.md"
    
    # Ensure output directory exists
    ensure_directory_exists(output_dir)
    
    # Read JSON data
    json_data = read_json_file(file_path=input_file)
    
    # Generate documentation
    output_path = stapdocgeneratorsummary(json_data, output_dir, output_filename)
    
    print(f"Documentation generated successfully: {output_path}")
def getAdditionalDetails(entry):
    supportDetails={}
    for key, value in entry.items():
        if key not in ["DatabaseName", "DatabaseVersion", "OSName", "OSVersion","GuardiumVersion"]:
            if value and value != "":
                supportDetails[key]=value
    return supportDetails
class SUPPORT(Enum):
    DATABASE_VERSION_SUPPORT = "DATABASE_VERSION_SUPPORT"
    DATABASE_VERSION_SUPPORT_OSSPECVER="DATABASE_VERSION_SUPPORT_OSSPECVER"
    DATABASE_VERSION_SUPPORT_OS = "DATABASE_VERSION_SUPPORT_OSV"
    DATABASE_SUPPORT_GDP = "DATABASE_SUPPORT_GDP"    
    DATABASE_SUPPORT_GDP_SPECVER="DATABASE_SUPPORT_GDP_SPECVER"         
def stapdocgeneratorsummary(json_data, output_dir, output_filename):
    """Generate documentation from JSON data"""
    output_path = os.path.join(output_dir, output_filename)
    separator = ', '
    summary_data: dict[Any, Any]={"ALL_DATABASE":[]}
    db_type_versions: dict[Any, str]={}
    #summary_osname={}
    #summarygdpversion: dict[Any, Any]={}
    #overall_summary=[]
    SingleEntrypoint={}
    QANS={}
    with open(output_path, 'w') as doc_file:
        #doc_file.write(f"# This documention contails Guardium Supported Database or Datasources Documentation for STAP\n\n")
        increment=0
        # Process each database type
        for db_type, db_entries in json_data.items():
            # Create a separate section for each database type
            #doc_file.write(f"## {db_type}\n\n")
            if "ALL_DATABASE" in summary_data and isinstance(summary_data["ALL_DATABASE"], list):
                 summary_data["ALL_DATABASE"].append(db_type)    
            # Process each entry for this database type
            for entry in db_entries:
                curSum=f"{db_type} supports Guardium/STAP version "
                # Extract key information
                db_name = entry.get("DatabaseName", ["Unknown Database"])
                db_versions = entry.get("DatabaseVersion", [])
                db_versions_str = separator.join([item.strip() for item in db_versions])

                os_names = entry.get("OSName", [])
                os_name_str = ", ".join(os_names)
                os_versions = entry.get("OSVersion", [])
                os_ver_str = separator.join([item.strip() for item in os_versions])

                gdp_versions = entry.get("GuardiumVersion", [])
                gdp_versions_str = separator.join([item.strip() for item in gdp_versions])

                if db_type in db_type_versions:
                    existingver=db_type_versions[db_type]
                    db_type_versions[db_type]=existingver+","+db_versions_str
                else:
                    db_type_versions[db_type]=db_versions_str
                if(db_type in SingleEntrypoint):
                    details=SingleEntrypoint[db_type]
                    if os_name_str in details:
                        osverdetails=details[os_name_str]
                        for curosver in os_versions:
                            if curosver in osverdetails:
                                detosver=osverdetails[curosver]
                                existingdbv=detosver["Database_Versions"]+","+db_versions_str
                                alluniqdbver=sorted(set(existingdbv.split(",")))
                                detosver["Database_Versions"]=separator.join(map(str, alluniqdbver))

                                existingdbv=detosver["Guardium_Versions"]+","+gdp_versions_str
                                alluniqdbver=sorted(set(existingdbv.split(",")))
                                detosver["Guardium_Versions"]=separator.join(map(str, alluniqdbver))

               
                                detosver["SUPPORT"]=getAdditionalDetails(entry)
                                osverdetails[curosver]=detosver
                            else:
                                detosver={}
                                detosver["Database_Versions"]=db_versions_str
                                detosver["Guardium_Versions"]=gdp_versions_str 
                                detosver["SUPPORT"]=getAdditionalDetails(entry)
                                osverdetails[curosver]=detosver 
                    else:
                        osverdetails={}
                        for curosver in os_versions:
                            detosver={}
                            detosver["Database_Versions"]=db_versions_str
                            detosver["Guardium_Versions"]=gdp_versions_str 
                            detosver["SUPPORT"]=getAdditionalDetails(entry)
                            osverdetails[curosver]=detosver
                    
                    details[os_name_str]=osverdetails
                    details[os_name_str]=osverdetails
                    SingleEntrypoint[db_type]=details 
                     
                else:
                    details={}
                    details[os_name_str]={}
                    osverdetails={}
                    for curosver in os_versions:
                        detosver={}
                        detosver["Database_Versions"]=db_versions_str
                        detosver["Guardium_Versions"]=gdp_versions_str 
                        detosver["SUPPORT"]=getAdditionalDetails(entry)
                        osverdetails[curosver]=detosver
                    details[os_name_str]=osverdetails
                    SingleEntrypoint[db_type]=details   
        
        all_list_values = []
        for value in summary_data.values():
           if isinstance(value, list):
              all_list_values.extend(value)
        string_list_values = [str(item) for item in all_list_values]
        result_string = '\n\t'.join(string_list_values)
    

        doc_file.write(f"# STAP supported databases\n")
        doc_file.write(f"STAP supports the following databases: \n\t{result_string}\n\n")
        for curdbs,val in db_type_versions.items():
            alluniqdbver=sorted(set(val.split(",")))
            string_dblist_values = [item.strip() for item in alluniqdbver]
            result_dstring = '\n\t'.join(string_dblist_values)
            doc_file.write(f"# Support for database {curdbs}\n")
            doc_file.write(f"The following versions of {curdbs} is supported by Guardium and STAP:\n\t{result_dstring}\n")
            #doc_file.write(f"# Latest supported version of database {curdbs} is {alluniqdbver[-1]}\n")
            doc_file.write(f"Latest version of {curdbs} supported by Guardium/STAP is {alluniqdbver[-1]}\n")
   
        
        NlpWriter(string_list_values,"nlpmodel.py")

        output_filename = "general.md"
        """Generate documentation from JSON data"""
        output_path = os.path.join(output_dir, output_filename)
        print(f"Generating documentation: {output_path}")
        dbsortlist=sorted(set(string_list_values))
        with open(output_path, 'a') as doc_gen:
            doc_gen.write(f"# The following databases are supported by IBM Guardium OnPrem-STAP\n")
            doc_gen.write(f"The following databases are supported by IBM Guardium:\nOnPrem-STAP\n===========\n\t")
            for curs in dbsortlist:
                doc_gen.write(f"{curs}\n\t")

        for dbkey,dbvalue in SingleEntrypoint.items():
            summString=f"## Support details for {dbkey}\n"
            qansstring="# Specific support information"
            summString=summString+f"These are the detailed support details for {dbkey} for Guardium STAP\n"
            for oskey,osvalue in dbvalue.items():
                summString=summString+f"\t Operating System: {oskey}\n"
                supportindividfulldb={}
                for osverkey,osverval in osvalue.items():
                    summString=summString+f"\t\tOperating System Versions: {osverkey}\n"
                    database_Versions=osverval["Database_Versions"]
                    summString=summString+f"\t\t\t{dbkey} Versions: {database_Versions}\n"
                    guardium_Versions=osverval["Guardium_Versions"]
                    summString=summString+f"\t\t\tGDP Versions: {guardium_Versions}\n"
                    #print(f"----->\n{osverval}")
                    support=osverval["SUPPORT"]
                    addtionalsupp="\nFeature supported by Teradata Versions are:"
                    for cursupportk,cursupval in support.items():
                        if(cursupval!="NA" and cursupval):
                            addtionalsupp=addtionalsupp+f"\n\t\t\t\t{cursupportk}:{cursupval}"
                            supdet={}
                            if cursupportk in supportindividfulldb:
                                supdet=supportindividfulldb[cursupportk]
                                if "DBVER" in supdet:
                                    existingdbv=supdet["DBVER"]+","+database_Versions
                                    alluniqdbver=sorted(set(existingdbv.split(",")))
                                    supdet["DBVER"]=separator.join(map(str, alluniqdbver))
                                else:
                                    supdet["DBVER"]=database_Versions
                                if "GDPVER" in supdet:
                                    existingdbv=supdet["GDPVER"]+","+database_Versions
                                    alluniqdbver=sorted(set(existingdbv.split(",")))
                                    supdet["GDPVER"]=separator.join(map(str, alluniqdbver))
                                else:
                                    supdet["GDPVER"]=guardium_Versions
                            else:
                                supdet["DBVER"]=database_Versions
                                supdet["GDPVER"]=guardium_Versions
                            supportindividfulldb[cursupportk]=supdet

                    addtionalsupp=addtionalsupp.strip()
                    summString=summString+f"\t\t\t{addtionalsupp}\n"

                    q=f"What are the {dbkey} versions support for {osverkey}"
                    a=f"The versions of {dbkey} supported running on {osverkey} are {database_Versions}\n{addtionalsupp}"
                    QAns(q,a,doc_file)

                    q=f"What are the {dbkey} support for {osverkey}"
                    a=f"The versions of {dbkey} supported running on {osverkey} are {database_Versions}\n{addtionalsupp}"
                    QAns(q,a,doc_file)

                    q=f"Does STAP support {dbkey} running on {osverkey}"
                    a=f"Yes, The following versions of {dbkey} are supported running on {osverkey}: "+database_Versions
                    QAns(q,a,doc_file)

                    for curdbv in database_Versions.split(","):
                        #print(curdbv.strip())
                        q=f"Does {curdbv.strip()} is supported by STAP on {osverkey} \n{addtionalsupp}"
                        a=f"Yes, {curdbv.strip()} is supported by STAP on {osverkey} \n{addtionalsupp}"
                        QAns(q,a,doc_file)
                        for cursupportk,cursupval in support.items():
                            q=f"Does {curdbv.strip()} supports {cursupportk}"
                            if(cursupportk!="Notes" and cursupval!="NA" and cursupval):
                                a=f"Yes, {curdbv.strip()} supports {cursupportk}, {cursupval} in the following environment running on {oskey},{osverkey}. \n\t{dbkey} versions {database_Versions}\n\tGuardium versions {guardium_Versions}" 
                                QAns(q,a,doc_file)                
                            else:    
                                a=f"No, {curdbv.strip()} does not support {cursupportk}. Details of the feature support:\n\t{addtionalsupp}"  
                                QAns(q,a,doc_file) 
                    for curdbv in guardium_Versions.split(","):
                        q=f"What are  Guardium support for {dbkey} running on {osverkey}"
                        a=f"The versions of Guardium for {dbkey} running on {osverkey} are Guardium versions {guardium_Versions} \n{addtionalsupp}"
                        QAns(q,a,doc_file) 
                        q=f"Does Guardium support {dbkey} running on {osverkey}"
                        a=f"Yes, Guardium supports {dbkey} running on {osverkey} on the following Guardium versions {guardium_Versions} \n{addtionalsupp}"
                        QAns(q,a,doc_file) 
                    for cursupportk,cursupval in support.items():
                        if(cursupportk!="Notes" and cursupval!="NA" and cursupval):
                            q=f"What are the {dbkey} versions that supports {cursupportk}"
                            supdet=supportindividfulldb[cursupportk]
                            subdbver=supdet["DBVER"]
                            a=f"The {dbkey} versions that supports {cursupportk} are {subdbver}. \n For detailed operating system that supports each version please ask or look for specific {dbkey} version." 
                            QAns(q,a,doc_file)  
            #summString=summString+"\n### ------------End details of {dbkey}-----------\n"

            doc_file.write((summString))
        writeTrainFile()   
    return output_path
def QAns(question,answer,doc_file):
    dataind={} 
    dataind["question"]=f"{question}?"
    dataind["answer"]=f"{answer}."
    data.append(dataind)
    docans=f"{answer.replace('Yes,','').replace('No,','').strip()}"
    #doc_file.write(f"\n# {docans.split('\n')[0]}\n{docans}")
def writeTrainFile():
    conffilename="QATrain.txt"
    with open(conffilename, 'a') as conffilename:
        conffilename.write(f"{json.dumps(data,indent=4)}") 
def print_nested_dict(d, indent=0):
    for key, value in d.items():
        print('  ' * indent + str(key) + ": ", end="")
        if isinstance(value, dict):
            print() # Newline for nested dictionaries
            print_nested_dict(value, indent + 1)
        elif isinstance(value, list):
            print("[")
            for item in value:
                print('  ' * (indent + 1) + str(item))
            print('  ' * indent + "]")
        else:
            print(value)
def NlpWriter(string_list_values,conffilename):
    #print("nlpwriter")

    nlpconfig ="db_configsystems = {\n"
    mydbdict={}
    for curdinfo in string_list_values:
        nlpconfig=nlpconfig+f"\t\"{curdinfo}\": \"DATABASE_SYSTEM\",\n"
        mydbdict[curdinfo]="DATABASE_SYSTEM"
    nlpconfig=nlpconfig.strip()[:-1]+"\n}"

    try:
        from nlpmodel import db_configsystems
    except Exception as e:
        with open(conffilename, 'w') as nlp_config_file:
            nlp_config_file.write(nlpconfig)
        from nlpmodel import db_configsystems    
    myDict=db_configsystems

    db_configsystems.update(mydbdict)
    pretty_json_string="db_configsystems="+json.dumps(obj=db_configsystems, indent=4)
    #print(pretty_json_string)
    with open(conffilename, 'w') as conffilename:
        conffilename.write(pretty_json_string)



def amazonkinesis():
    print("Amazon Kinesis document generation")
    input_file = "{JSON_DIR}/AWS_AmKin.json"
    output_filename = "aws_amkin.md"
    awsgeneral(input_file,output_filename,"Amazon Kinesis(AWS)",platform="AWS")
def amazonexstap():
    print("Amazon Kinesis document generation")
    input_file = "{JSON_DIR}/AWS_ExStap.json"
    output_filename = "aws_ExStap.md"
    awsgeneral(input_file,output_filename,"External-STAP(AWS)","AWS")
def awsuc():
    print("Amazon Kinesis document generation")
    input_file = "{JSON_DIR}/AWS_UC.json"
    output_filename = "aws_uc.md"
    awsgeneral(input_file,output_filename,"Universal Connector(AWS)","AWS")
def azureAZEvHub():
    print("Azure Kinesis document generation")
    input_file = "{JSON_DIR}/Azure_AzEvHub.json"
    output_filename = "azure_eventhub.md"
    awsgeneral(input_file,output_filename,"Azure Event hubs","Azure")
def azure_exstap():
    print("Azure Kinesis document generation")
    input_file = "{JSON_DIR}/Azure_ExStap.json"
    output_filename = "azure_exstap.md"
    awsgeneral(input_file,output_filename,"External-STAP(Azure)","Azure")
def azureuc():
    print("Azure Kinesis document generation")
    input_file = "{JSON_DIR}/Azure_UC.json"
    output_filename = "azure_uc.md"
    awsgeneral(input_file,output_filename,"Universal Connector(UC)","Azure")
def gcp_exstap():
    print("GCP  document generation")
    input_file = "{JSON_DIR}/GCP_ExStap.json"
    output_filename = "gcp_exstap.md"
    awsgeneral(input_file,output_filename,"External-STAP(GCP)","GCP or Google Cloud Platform")
def gcpuc():
    print("GCP document generation")
    input_file = "{JSON_DIR}/GCP_UC.json"
    output_filename = "gcp_uc.md"
    awsgeneral(input_file,output_filename,"Universal Connector(GCP)","GCP or Google Cloud Platform")
def ibm_exstap():
    print("IBM  document generation")
    input_file = "{JSON_DIR}/IBMCloud_ExStap.json"
    output_filename = "ibm_exstap.md"
    awsgeneral(input_file,output_filename,"External-STAP(IBM Cloud)","IBM Cloud Platform")
def ibmuc():
    print("IBM document generation")
    input_file = "{JSON_DIR}/IBMCloud_UC.json"
    output_filename = "ibm_uc.md"
    awsgeneral(input_file,output_filename,"Universal Connector(IBM Cloud)","IBM Cloud Platform")
def oracle_exstap():
    print("Oracle  document generation")
    input_file = "{JSON_DIR}/OracleCloud_ExStap.json"
    output_filename = "oracle_exstap.md"
    awsgeneral(input_file,output_filename,"External-STAP(Oracle Cloud)","Oracle Cloud Platform")
def oracleuc():
    print("GCP document generation")
    input_file = "{JSON_DIR}/OracleCloud_UC.json"
    output_filename = "oracle_uc.md"
    awsgeneral(input_file,output_filename,"Universal Connector(Oracle Cloud)","Oracle Cloud Platform")
def onprem_uc():
    print("Onprem UC  document generation")
    input_file = "{JSON_DIR}/OnPrem_UC.json"
    output_filename = "onprem_uc.md"
    awsgeneral(input_file,output_filename,"Universal_Connector(On Premise)","On Premise")
def awsgeneral(input_file,output_filename,type,platform):
    output_dir = "doc"
    
    ensure_directory_exists(output_dir)
    
    # Read JSON data
    json_data = read_json_file(file_path=input_file)
     
    """Generate documentation from JSON data"""
    output_path = os.path.join(output_dir, output_filename)
    
    with open(output_path, 'w') as doc_file:
        gdsc="Guardium Data Security Center"
        doc_file.write(f"# This documention contails Guardium {type} Supported {platform} Datasources/Database Documentation and {gdsc} Supported Datasources/Database Documentation\n\n")
        summary_data: dict[Any, Any]={"ALL_DATABASE":[]}
        # Process each database type
        for db_type, db_entries in json_data.items():
            # Create a separate section for each database type
            #doc_file.write(f"## {db_type}\n\n")
            
            # Process each entry for this database type
            for entry in db_entries:
                # Extract key information
                gdp_type= entry.get("GDP_Type", ["Unknown GDP Type"])
                db_name = entry.get("DataSource", ["Unknown Database"])
                db_versions = entry.get("DataSource_Version", [])
                gdp_versions = entry.get("Guardium_Version", [])

                if "ALL_DATABASE" in summary_data and isinstance(summary_data["ALL_DATABASE"], list):
                    summary_data["ALL_DATABASE"].append(db_type)    

                # Format database versions as comma-separated string
                if isinstance(db_versions, list):
                    db_versions_str = ", ".join(db_versions)
                else:
                    db_versions_str = str(db_versions)
                
                if isinstance(gdp_versions, list):
                    gdp_versions = ", ".join(gdp_versions)
                else:
                    gdp_versions = str(gdp_versions)    
                
                # Write the main description
                #doc_file.write(f"### {', '.join(db_name)} Support\n\n")
                if "GDP" in gdp_type:
                    doc_file.write(f"## # Support for database database {', '.join(db_name)} for {', '.join(gdp_type)} {type} and versions are {db_versions_str}.\n")
                    doc_file.write(f"{', '.join(db_name)} is supported by GDP {type}/{platform}. The versions supported are {db_versions_str}\n")
                elif "GI" in gdp_type:
                    doc_file.write(f"## # Support for database database {', '.join(db_name)} for {', '.join(gdp_type)}/{gdsc} {type} and versions are {db_versions_str}.\n")
                    doc_file.write(f"{', '.join(db_name)} is supported by {gdsc} {type}/{platform}. The versions supported are {db_versions_str}\n")
                elif "GI GI SaaS" in gdp_type:
                    doc_file.write(f"## # Support for database database {', '.join(db_name)} for {', '.join(gdp_type)} {type} and versions are {db_versions_str}\n")
                    doc_file.write(f"{', '.join(db_name)} is supported by GI and GDSC SaaS (GI‑SaaS) {type}/{platform}. The versions supported are {db_versions_str}.\n")

                # Write additional details
                writetit=True
                # Add all other keys as additional details
                for key, value in entry.items():
                    if key not in ["DataSource","GDP_Type","DataSource_Version","Guardium_Version"]:
                        if value and value != "":  # Only include non-empty values
                            if(writetit):
                                doc_file.write("-- Additional details for this configuration are listed below.\n")
                                writetit=False
                            if isinstance(value, list):
                                value_str = ", ".join(value)
                            else:
                                value_str = str(value)
                            nkey=key.replace('_supported', '')
                            if value_str.lower()=="yes":   
                                doc_file.write(f" {', '.join(db_name)} supports {nkey}\n")
                            else:
                                if key=="Notes":
                                    doc_file.write(f"{nkey}: {value_str}\n") 
                                else:
                                    doc_file.write(f" {', '.join(db_name)} supports {nkey}: {value_str}\n") 
          
                

        all_list_values = []
        for value in summary_data.values():
            if isinstance(value, list):
                all_list_values.extend(value)
        alluniqdbver=sorted(set(all_list_values))
         
        #print(f"{all_list_values}")
        string_list_values = [str(item) for item in alluniqdbver]
        result_string = '\n\t'.join(string_list_values)
        doc_file.write(f"# {platform} {type} supported databases\n")
        doc_file.write(f" {platform} {type} supported databases: \n\t{result_string}\n\n")
        NlpWriter(string_list_values,"nlpmodel.py")


        output_filename = "general.md"
        """Generate documentation from JSON data"""
        output_path = os.path.join(output_dir, output_filename)
        print(f"Generating documentation: {output_path}")
        dbsortlist=sorted(set(string_list_values))
        with open(output_path, 'a') as doc_gen:
            doc_gen.write(f"\n{type}\n=====================\n\t")
            for curs in dbsortlist:
                doc_gen.write(f"{curs}\n\t")
        doc_file.write("\n")  # Add separator between entries
    print(f"Documentation generated successfully: {output_path}")
    return
def fullDBWriter():
    from nlpmodel import db_configsystems
    from DBUnderstand import DBUnderstand
    output_dir = "doc"
    ensure_directory_exists(output_dir)
    output_filename = "general.md"
    """Generate documentation from JSON data"""
    output_path = os.path.join(output_dir, output_filename)
    print(f"Generating documentation: {output_path}")
    with open(output_path, 'a') as doc_file:
        dbunsertand=DBUnderstand()
        clounddb=dbunsertand.get_cloud_databases()
        nosqldbs=dbunsertand.get_nosql_databases()
        ibmdbs=dbunsertand.get_ibm_databases()
    
        string_list_values = [str(item) for item in nosqldbs]
        result_string = '\n\t'.join(string_list_values)
        doc_file.write("\n# NoSQL database support\n")
        doc_file.write(f"The following NoSQL databases are supported by Guardium \n\t{result_string}")
        string_list_values = [str(item) for item in ibmdbs]
        result_string = '\n\t'.join(string_list_values)
        doc_file.write("\n# IBM database support\n")
        doc_file.write(f"The following IBM databases are supported by Guardium \n\t{result_string} \n")
        string_list_values = [str(item) for item in clounddb]
        result_string = '\n\t'.join(string_list_values)
        doc_file.write("\n# Cloud support\n")
        doc_file.write(f"The following Cloud databases are supported by Guardium \n\t{result_string} \n")



def main():
    output_dir = DOC_DIR
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    output_filename = "general.md"
    output_path = os.path.join(output_dir, output_filename)
    with open(output_path, 'w') as doc_file:
        doc_file.write("# General information\n")    
    conffilename="QATrain.txt"
    with open(conffilename, 'w') as conffilename:
         conffilename.write("")
    stapmain()

    amazonkinesis()
    amazonexstap()
    awsuc()
    azureAZEvHub()
    azure_exstap()
    azureuc()
    gcp_exstap()
    gcpuc()
    ibm_exstap()    
    ibmuc()
    oracle_exstap()
    oracleuc()
    onprem_uc()
    fullDBWriter()


    # Add other functions here
if __name__ == "__main__":
    main()

