#!/usr/bin/env python3
"""
CustomTrain.py - Generate training data from all database documentation files

This script reads all markdown files in the doc directory and generates a TrainDataSet.json file
with questions and answers based on the content, following the format in QATrain.model.
"""
import traceback
import json
import re
import os
from pathlib import Path

def read_markdown_file(file_path):
    """Read the content of a markdown file"""
    with open(file_path, 'r') as file:
        return file.read()

def extract_database_info(content, file_name=""):
    """Extract database information from the markdown content"""
    # Initialize variables
    supported_dbs = []
    db_info = {}
    
    # Extract the list of supported databases - try different patterns based on file type
    supported_dbs_patterns = [
        r"# STAP supported databases\nSTAP supports the following databases: \n\t(.*?)\n\n",
        r"# Supported databases\n.*?following databases: \n\t(.*?)\n\n",
        r"# Supported databases\n(.*?)\n\n",
        r"# Databases\n(.*?)\n\n"
    ]
    
    for pattern in supported_dbs_patterns:
        supported_dbs_match = re.search(pattern, content, re.DOTALL)
        if supported_dbs_match:
            raw_dbs = supported_dbs_match.group(1)
            if '\n\t' in raw_dbs:
                supported_dbs = [db.strip() for db in raw_dbs.split('\n\t')]
            else:
                supported_dbs = [db.strip() for db in raw_dbs.split('\n')]
            break
    #print(f"Supporteed dbs: {supported_dbs}")
    db_info['supported_dbs'] = supported_dbs
    # If no supported databases found, try to extract from the file name
    if not supported_dbs and file_name:
        db_name = os.path.basename(file_name).split('_')[0].replace('.md', '')
        if db_name:
            supported_dbs = [db_name.upper()]
    
    # Extract database version information - try different patterns
    db_section_patterns = [
        r"# Support for database (.*?)\n(.*?)(?=# Support for database|\Z)",
        r"# (.*?) Support\n(.*?)(?=# .*? Support|\Z)",
        r"# (.*?)\n(.*?)(?=# |\Z)"
    ]
    
    # Initialize db_sections to avoid unbound variable error
    db_sections = []
    
    for pattern in db_section_patterns:
        db_sections = re.findall(pattern, content, re.DOTALL)
        if db_sections:
            break
    
    # If no database sections found but we have a database name from the file, create a basic entry
    if not db_sections and file_name:
        db_name = os.path.basename(file_name).split('_')[0].replace('.md', '')
        if db_name:
            # Extract any version information using a generic pattern
            versions_match = re.search(r"versions?:?\s*(.*?)(?:\n\n|\Z)", content, re.IGNORECASE | re.DOTALL)
            versions_text = versions_match.group(1) if versions_match else ""
            db_sections = [(db_name.upper(), versions_text)]
    
    for db_name, db_content in db_sections:
        db_name = db_name.strip()
        db_info[db_name] = {
            'versions': [],
            'latest_version': '',
            'details': {},
            'os_info': {}
        }
        
        # Extract versions
        versions_match = re.search(r"The following versions of .* is supported by Guardium and STAP:\n\t(.*?)Latest version", 
                                 db_content, re.DOTALL)
        #print(f"Versions match:{versions_match}")
        if versions_match:
            exacdbm=[v.strip() for v in versions_match.group(1).split('\n\t')]
            db_info[db_name]['versions'] = exacdbm
            #print(f"Exact version match for {db_name} is {exacdbm}")
        
        # Extract latest version
        latest_match = re.search(r"Latest version of .* supported by Guardium/STAP is (.*?)\n", db_content)
        if latest_match:
            db_info[db_name]['latest_version'] = latest_match.group(1).strip()
        
        # Extract support details if available
        support_details_match = re.search(r"## Support details for " + re.escape(db_name) + r"\n(.*?)(?=##|\Z)", content, re.DOTALL)
        if support_details_match:
            db_details = support_details_match.group(1)
            db_info[db_name]['details'] = db_details
            #print(f"Support details for {db_name} found  {db_details}")
            # Extract OS information
            os_regex = r"Operating System: (.*?)\n\t\tOperating System Versions: (.*?)\n"
            os_matches = re.findall(os_regex, db_details, re.DOTALL)
            #print(f"Support details for {db_name} found  O/s {os_matches}")
            # If we found OS matches, now extract the full details for each OS
            if os_matches:
                for os_name, os_version in os_matches:
                    # Extract the details for this OS version - match the exact format with spaces
                    # Create a regex pattern that matches the specific OS version section
                    os_section_regex = r"Operating System Versions: " + re.escape(os_version) + r"\n\t\t\t" + re.escape(db_name) + r" Versions:\s*(.*?)\n\t\t\tGDP Versions:\s*(.*?)\n\t\t\tFeature supported by .* Versions are(.*?)(?=\n\t\t\tNotes|\n\t\t\t\n|\n\t\t\t$|\n\t\t$|\n\t\tOperating System Versions:|$)"
                    os_section_match = re.search(os_section_regex, db_details, re.DOTALL)
                    if os_section_match:
                        db_versions = os_section_match.group(1).strip()
                        gdp_versions = os_section_match.group(2).strip()
                        features = os_section_match.group(3).strip()
                        
                        if os_name not in db_info[db_name]['os_info']:
                            db_info[db_name]['os_info'][os_name] = {}
                        
                        db_info[db_name]['os_info'][os_name][os_version] = {
                            'db_versions': [v.strip() for v in db_versions.split(',')],
                            'gdp_versions': [v.strip() for v in gdp_versions.split(',')],
                            'features': {}
                        }
                        
                        # Extract features
                        feature_lines = features.strip().split('\n')
                        for feature_line in feature_lines:
                            if ':' in feature_line:
                                feature_name, feature_value = feature_line.strip().split(':', 1)
                                db_info[db_name]['os_info'][os_name][os_version]['features'][feature_name.strip()] = feature_value.strip()
                    # No need for an else clause here as we're just skipping OS versions we can't parse
            
            # This loop is no longer needed as we're handling OS matches in the code above
            # The os_matches variable now only contains (os_name, os_version) tuples
            # and we're processing them in the loop above
    
    return supported_dbs, db_info

def create_model_format_entries(supported_dbs, db_info):
    """Create entries in the QATrain.model format"""
    model_entries = []
    
    # Create a general entry for all supported databases
    general_context = f"STAP supports the following databases: {', '.join(supported_dbs)}. These databases are compatible with IBM Guardium's security monitoring capabilities."
    general_qas = [
        {
            "question": "What databases are supported by STAP?",
            "answer": {
                "text": f"{', '.join(supported_dbs)}",
                "answer_start": 27
            }
        },
        {
            "question": "How many databases does STAP support?",
            "answer": {
                "text": f"{len(supported_dbs)} databases",
                "answer_start": 27
            }
        }
    ]
    
    model_entries.append({
        "id": "stap_supported_databases",
        "context": general_context,
        "qas": general_qas
    })
    
    # Create entries for each database
    for db_name, info in db_info.items():
        if db_name == 'supported_dbs':
            continue
        if not info['versions']:
            continue
            
        # Create context for database versions
        versions_str = ', '.join(info['versions'])
        latest_version = info['latest_version'] if info['latest_version'] else "unknown"
        db_context = f"{db_name} supports the following versions: {versions_str}. The latest version supported is {latest_version}."
        
        db_qas = [
            {
                "question": f"What versions of {db_name} are supported by STAP?",
                "answer": {
                    "text": versions_str,
                    "answer_start": db_context.find(versions_str)
                }
            },
            {
                "question": f"Does STAP support {db_name}?",
                "answer": {
                    "text": f"{versions_str}",
                    "answer_start": 0
                }
            },
            {
                "question": f"What is the latest version of {db_name} supported by STAP?",
                "answer": {
                    "text": latest_version,
                    "answer_start": db_context.find(latest_version)
                }
            }
        ]
        
        model_entries.append({
            "id": f"{db_name.lower().replace(' ', '_')}_versions",
            "context": db_context,
            "qas": db_qas
        })
        
        # Create entries for OS-specific support
        if 'os_info' in info and info['os_info']:
            mydict=info['os_info']
            allosname=", ".join(mydict.keys())
            #print(f"Adding OS-specific question: {allosname} for {db_name}")
            #print(f"Adding OS-specific question: {allosname}")
            for os_name, os_versions in info['os_info'].items():
                #print(f"Adding for {db_name} for {os_name}")
                for os_version, os_details in os_versions.items():
                    db_versions_str = ', '.join(os_details['db_versions'])
                    gdp_versions_str = ', '.join(os_details['gdp_versions'])
                    
                    # Create feature text
                    feature_text = ""
                    if 'features' in os_details and os_details['features']:
                        feature_text = "The features supported on this operating system are: "
                        features_list = []
                        for feature_name, feature_value in os_details['features'].items():
                            if feature_value:
                                features_list.append(f"{feature_name} ({feature_value})")
                        feature_text += ", ".join(features_list) + "."
                        #print(f"Adding fature question: {feature_text}")
      
                    
                    # Create context
                    os_context = f"{db_name} supports the following versions on {os_version}: {db_versions_str}. {feature_text}"
                    
                    os_qas = [
                        {
                            "question": f"Is {db_name} is supported?",
                            "answer": {
                                "text": db_versions_str,
                                "answer_start":  os_context.find(db_versions_str)
                            }
                        },
                        {
                            "question": f"What are the {db_name} versions supported for {os_version}?",
                            "answer": {
                                "text": db_versions_str,
                                "answer_start": os_context.find(db_versions_str)
                            }
                        },
                        {
                            "question": f"Does STAP support {db_name} running on {os_version}?",
                            "answer": {
                                "text": f"{db_name} supports the following versions on {os_version}: {db_versions_str}",
                                "answer_start": 0
                            }
                        }
                    ]
                    
                    # Add feature-specific questions
                    if 'features' in os_details and os_details['features']:
                        ffdetails=os_details['features']
                        fNotes=""
                        if "Notes" in ffdetails:
                            fNotes=ffdetails["Notes"]
                        for feature_name, feature_value in os_details['features'].items():
                            feature_text = f"{feature_name} ({feature_value})"
                            feature_start = os_context.find(feature_text)

                            if feature_name!="Notes" and feature_name:
                                if feature_start >= 0:

                                    if db_name=="Teradata":
                                        print(f"Adding feature question: {db_name}")
                                    # Original question pattern
                                    os_qas.append({
                                        "question": f"Does {db_name} support {feature_name} on {os_version}?",
                                        "answer": {
                                            "text": f"{feature_text}" ,
                                            "answer_start": feature_start
                                        }
                                    })
    
                                    os_qas.append({
                                        "question": f"Does {db_name} support {feature_name}?",
                                        "answer": {
                                            "text": feature_text,
                                            "answer_start": feature_start
                                        }
                                    })
                                    # New question pattern 1: Does {feature} is supported by {dbname_version}
                                    for db_version in os_details['db_versions']:
                                        #print(f"Adding feature-specific question: {feature_name}")
                                        os_qas.append({
                                            "question": f"Does {feature_name} can be used on  {db_version}?",
                                            "answer": {
                                                "text": feature_text,
                                                "answer_start": feature_start
                                            }
                                        })
                                        os_qas.append({
                                            "question": f"Does {feature_name} is supported by {db_version}?",
                                            "answer": {
                                                "text": feature_text,
                                                "answer_start": feature_start
                                            }
                                        })
                                    
                                    # New question pattern 2: Does {feature} support on {os_version}?
                                    os_qas.append({
                                        "question": f"Does {feature_name} support on {os_version}?",
                                        "answer": {
                                            "text": feature_text,
                                            "answer_start": feature_start
                                        }
                                    })
                    
                    model_entries.append({
                        "id": f"{db_name.lower().replace(' ', '_')}_{os_version.lower().replace(' ', '_')}",
                        "context": os_context,
                        "qas": os_qas
                    })
    
    return model_entries

def get_all_markdown_files(doc_dir):
    """Get all markdown files in the doc directory"""
    md_files = []
    for file in os.listdir(doc_dir):
        if file.endswith(".md"):
            md_files.append(os.path.join(doc_dir, file))
    return md_files

def process_markdown_file(file_path):
    """Process a single markdown file and return model entries"""
    # Read the markdown file
    content = read_markdown_file(file_path)
    
    # Extract information
    supported_dbs, db_info = extract_database_info(content, file_path)
    print(supported_dbs)
    
    # Create entries in QATrain.model format
    return create_model_format_entries(supported_dbs, db_info)

def consolidate_database_entries(model_entries):
    """Consolidate multiple database entries into a single entry"""
    # Find all entries with id 'stap_supported_databases'
    db_entries = [entry for entry in model_entries if entry['id'] == 'stap_supported_databases']
    
    # Extract all database names
    all_dbs = []
    for entry in db_entries:
        context = entry['context']
        db_match = re.search(r"STAP supports the following databases: (.*?)\.", context)
        if db_match:
            dbs = db_match.group(1).split(', ')
            all_dbs.extend(dbs)
    
    # Remove duplicates and sort
    all_dbs = sorted(list(set(all_dbs)))
    
    # Create a new consolidated entry
    if all_dbs:
        consolidated_context = f"STAP supports the following databases: {', '.join(all_dbs)}. These databases are compatible with IBM Guardium's security monitoring capabilities."
        consolidated_entry = {
            "id": "stap_supported_databases",
            "context": consolidated_context,
            "qas": [
                {
                    "question": "What databases are supported by STAP?",
                    "answer": {
                        "text": f"{', '.join(all_dbs)}",
                        "answer_start": 27
                    }
                },
                {
                    "question": "How many databases does STAP support?",
                    "answer": {
                        "text": f"{len(all_dbs)} databases",
                        "answer_start": 27
                    }
                }
            ]
        }
        
        # Remove all old entries and add the consolidated one
        model_entries = [entry for entry in model_entries if entry['id'] != 'stap_supported_databases']
        model_entries.insert(0, consolidated_entry)
    
    return model_entries

def main():
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    doc_dir = os.path.join(script_dir, "doc")
    output_file_path = os.path.join(script_dir, "TrainDataSet.json")
    
    # Get all markdown files
    md_files = get_all_markdown_files(doc_dir)
    
    # Process all markdown files
    all_model_entries = []
    for md_file in md_files:
        print(f"Processing {os.path.basename(md_file)}...")
        try:
            model_entries = process_markdown_file(md_file)
            all_model_entries.extend(model_entries)
        except Exception as e:
            print(f"Error processing {os.path.basename(md_file)}: {str(e)}")
            traceback.print_exc()
    
    # Consolidate database entries
    all_model_entries = consolidate_database_entries(all_model_entries)
    
    # Write to JSON file
    with open(output_file_path, 'w') as json_file:
        json.dump(all_model_entries, json_file, indent=2)
    
    print(f"Generated {len(all_model_entries)} context entries with {sum(len(entry['qas']) for entry in all_model_entries)} question-answer pairs in {output_file_path}")

if __name__ == "__main__":
    main()

# Made with Bob
