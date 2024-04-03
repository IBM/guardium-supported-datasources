import { Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import React from 'react';
import '../styles/styles.css'
import CompatMatrix from './CompatMatrix';


const BLOCK_CLASS = `connections-doc`;

function isNumber(str) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}

const getRangeStringFromList = (versionList) => {

  if (versionList == null) {
      return ''; 
    }


  versionList.sort((a,b) => {
    return splitStringsCompare(splitStrings(a),splitStrings(b))
  })
  

  if (versionList.length === 1) {
      return versionList[0];
    } else if (versionList.length > 1) {
      return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
    }
    return '';
}

export function splitStringsCompare(lstStr1,lstStr2) {
  
  if (lstStr1.length == 0) {
    if (lstStr2.length == 0) {return 1} else {return -1}
  }

  if (lstStr1[0] == lstStr2[0]){return splitStringsCompare(lstStr1.slice(1),lstStr2.slice(1))}

  if (isNumber(lstStr1[0]) && isNumber(lstStr2[0])) {
    if (Number(lstStr1[0]) >= Number(lstStr2[0])) {
      return 1
    } else {
      return -1
    }
  } else {
    return lstStr1[0].localeCompare(lstStr2[0])
  }




}

export function splitStrings(str1) {
  // Define the regular expression to match spaces, dots, or hyphens
  const regex = /[ -]+/;

  // Split the strings using the regex
  const list1 = str1.split(regex);
  
  // Return the arrays of substrings
  return list1;
}

function numericalListCompare(stra1, strb1,stra2,strb2){

// Regular expression to match substrings between parentheses
const regex = /\([^)]*\)/g; 

// Remove substrings between parentheses
const cleanStr1 = stra1.replace(regex, '').trim();
const cleanStr2 = strb1.replace(regex, '').trim();

// Extract numbers from the cleaned strings
const matches1 = cleanStr1.match(/-?\d+(\.\d+)?/g);
const matches2 = cleanStr2.match(/-?\d+(\.\d+)?/g);

const sum = (numbers) => numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

const num1 = sum(matches1 ? matches1.map(Number) : []);
const num2 = sum(matches2 ? matches2.map(Number) : []);



if (num1 > num2) {
  return 1
}
else if (num2 > num1) {
  return -1
} else {
  return numericalListCompare(stra2,strb2,"1","2")
}
}


const TABLETYPE1 = {
  id: 1,
  headers: [
  {
    id: 0,
    headerName: "Database Version",
    headerKey: "DatabaseVersion",
    sorta: (rowa, rowb) => {
      return numericalListCompare(rowa.DatabaseVersion[0],rowb.DatabaseVersion[0],
        rowa.DatabaseVersion[rowa.DatabaseVersion.length -1],rowb.DatabaseVersion[rowb.DatabaseVersion.length -1]);
    },
    sortd: (rowb, rowa) => {
      return numericalListCompare(rowa.DatabaseVersion[0],rowb.DatabaseVersion[0],
        rowa.DatabaseVersion[rowa.DatabaseVersion.length -1],rowb.DatabaseVersion[rowb.DatabaseVersion.length -1]);
    },
    getReadableString: (lsta) => {
      return getRangeStringFromList(lsta);
    },
  },
  {
    id: 1,
    headerName: "Guardium Version",
    headerKey: "GuardiumVersion",
    sorta: (rowa, rowb) => {
      
      return numericalListCompare(rowa.GuardiumVersion[0],rowb.GuardiumVersion[0],
        rowa.GuardiumVersion[rowa.GuardiumVersion.length -1],rowb.GuardiumVersion[rowb.GuardiumVersion.length -1]);
    },
    sortd: (rowb, rowa) => {
      
      return numericalListCompare(rowa.GuardiumVersion[0],rowb.GuardiumVersion[0],
        rowb.GuardiumVersion[rowb.GuardiumVersion.length -1],rowa.GuardiumVersion[rowa.GuardiumVersion.length -1]);
    },
    getReadableString: (lsta) => {
      return getRangeStringFromList(lsta);
    },
  },
  {
    id: 2,
    headerName: "OS Version",
    headerKey: "OSVersion",
    sorta: (rowa, rowb) => {
      return rowa.OSVersion[0].localeCompare(
        rowb.OSVersion[0]
      );
    },
    sortd: (rowb, rowa) => {
      return rowa.OSVersion[0].localeCompare(
        rowb.OSVersion[0]
      );
    },
    getReadableString: (lsta) => {
      return getRangeStringFromList(lsta);
    },
  },
],
features: [
  {
    featureName: "Network Traffic",
    featureKey: "Network traffic",

  },
  {
    featureName: "Encrypted Traffic",
    featureKey: "Encrypted traffic",

  },
  {
    featureName: "Shared Memory",
    featureKey: "Shared Memory",

  },
  {
    featureName: "Kerberos",
    featureKey: "Kerberos",

  },
  {
    featureName: "Blocking",
    featureKey: "Blocking",

  },
  {
    featureName: "Redaction",
    featureKey: "Redaction",

  },
  {
    featureName: "UID Chain",
    featureKey: "UID Chain",

  },
  {
    featureName: "Compression",
    featureKey: "Compression",

  },{
    featureName: "Query Rewrite",
    featureKey: "Query Rewrite",

  },
  {
    featureName: "Instance Discovery",
    featureKey: "Instance Discovery",

  },
  {
    featureName: "Protocol",
    featureKey: "Protocol",

  },
],
}
;


const TABLETYPE2 = {
  id: 2,
  headers: [
    {
      id: 0,
      headerName: "Guardium Version",
      headerKey: "Guardium_Version",
      sorta: (rowa, rowb) => {
        return numericalListCompare(rowa.Guardium_Version[0],rowb.Guardium_Version[0],
          rowa.Guardium_Version[rowa.Guardium_Version.length -1],rowb.Guardium_Version[rowb.Guardium_Version.length -1]);
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(rowa.Guardium_Version[0],rowb.Guardium_Version[0],
          rowa.Guardium_Version[rowa.Guardium_Version.length -1],rowb.Guardium_Version[rowb.Guardium_Version.length -1]);
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 1,
      headerName: "Database Version",
      headerKey: "DataSource_Version",
      sorta: (rowa, rowb) => {
        return numericalListCompare(rowa.DataSource_Version[0],rowb.DataSource_Version[0],
          rowa.DataSource_Version[rowa.DataSource_Version.length -1],rowb.DataSource_Version[rowb.DataSource_Version.length -1]);
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(rowa.DataSource_Version[0],rowb.DataSource_Version[0],
          rowa.DataSource_Version[rowa.DataSource_Version.length -1],rowb.DataSource_Version[rowb.DataSource_Version.length -1]);
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
  ],
  features: [
    {
      featureName: "VA Supported",
      featureKey: "VA_supported",
      sorta: (rowa, rowb) => {
        return rowa.VA_supported[0].localeCompare(
          rowb.VA_supported[0]
        );
      },
      sortd: (rowb, rowa) => {
        return rowa.VA_supported[0].localeCompare(
          rowb.VA_supported[0]
        );
      },
      getReadableString: (str) => {return str}
  
    },
    {
      featureName: "Classification Supported",
      featureKey: "Classification_supported",
      getReadableString: (str) => {return str}
  
    },
    {
      featureName: "Download URL",
      featureKey: "Download_URL",
      getReadableString: (str) => {return str}
  
    },
    {
      featureName: "ReadMe URL",
      featureKey: "Readme_URL",
      getReadableString: (str) => {return str}
  
    },
]
};

const getJSONData = (environment,method) => {
  let key = `${environment}|${method}`
  console.log(`This is the key: ${key}`)
  switch (key){
    case "AWS (Database as a Service)|Amazon Kinesis":
      return [require(`../data/consolidated_csvs/AWS_AmKin.json`),TABLETYPE2]
    case "AWS (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/AWS_ExStap.json`),TABLETYPE2]
    case "AWS (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/AWS_UC.json`),TABLETYPE2]
    case "Azure (Database as a Service)|Azure Event Hubs":
      return [require(`../data/consolidated_csvs/Azure_AzEvHub.json`),TABLETYPE2]
    case "Azure (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/Azure_ExStap.json`),TABLETYPE2]
    case "Azure (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/Azure_UC.json`),TABLETYPE2]
    case "GCP (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/GCP_ExStap.json`),TABLETYPE2]
    case "GCP (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/GCP_UC.json`),TABLETYPE2]
    case "IBM Cloud (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/IBMCloud_ExStap.json`),TABLETYPE2]
    case "IBM Cloud (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/IBMCloud_UC.json`),TABLETYPE2]
    case "On-premise or IaaS|STAP":
      return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLETYPE1]
    case "On-premise or IaaS|External STAP": //TODO:What is this??
      return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLETYPE1] 
    case "On-premise or IaaS|Universal Connector":
      return [require(`../data/consolidated_csvs/OnPrem_UC.json`),TABLETYPE1]
    case "Oracle Cloud (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/OracleCloud_ExStap.json`),TABLETYPE2]

    default:
      console.log(`This is the error key: ${key}`)
      return [null,null]
      
  } 

}

// MOVE TO CONSTANTS

// Helper function to generate UI
const generateOrderListItem = (item) => {
  
    if (item.title && item.content && Array.isArray(item.content)){
  
      return (
        
        <ListItem>
          {item.title}
        <UnorderedList nested>
              {item.content.map((nestedItem) => (          
                generateOrderListItem(nestedItem)
                  
              ))}
        </UnorderedList>     
        </ListItem>
      )
    }
  
    if (item){
      return (<ListItem>{item}</ListItem>)
  
    }
    else {
      return null
    }
  }
  
  // Helper function to generate UI
  const generateAccordianItem = (item) => {
    switch (item.type.toLowerCase()) {
      case "string":
        if ( Array.isArray(item.content)){
          
          return (
            <div class="generatedAccordionItem">
              <ul>
  
              {item.content.map((cntnt) => {
                
                return (<li>
                {cntnt}
              <br></br>
                </li>)
  
              })}
              </ul>
          </div>
          )
  
  
        }
  
        return <div>{item.content}</div>
      case "orderedlist":
        return (
          <UnorderedList>
            {item.content.map((nestedItem) =>
            (
              generateOrderListItem(nestedItem)
            ))}
          </UnorderedList>
        )
      case "unordered":
        return (
          <OrderedList>
            {item.content.map((nestedItem) =>
            (
              generateOrderListItem(nestedItem)
            ))}
          </OrderedList>
        )
      case "link":
        return <Link href={item.content.link}>{item.content.title}</Link>
      default:
        return null
    }
  }
  

//DatasourceModal - Component used in modal for info of datasource
export function DatasourceModal({ selectedDataSource, connectionData, selectedProduct }) {
    
    const [jsonDataForDB, setJsonDataForDB] = React.useState(null)
    const [selectedEnvironment, _setSelectedEnvironment] = useState(null)
    const [selectedMethod, _setSelectedMethod] = useState(null)
    const [tableType, setTableType] = useState(null); 
  
    useEffect(() => {
      setSelectedEnvironment(null)  
      setJsonDataForDB(null)

    }, [selectedDataSource]);

    useEffect(() => {
      

    },[jsonDataForDB])
  
    const [toolTipOpen,setToolTipOpen] = useState([false,false,false]);
  
    // const [selectedOtherMethod, setOtherSelectedMethod] = useState(null)
  
    const setSelectedEnvironment = (environment) => {
      _setSelectedEnvironment(environment)
      setSelectedMethod(null);
    }
  
    const setSelectedMethod = (method) => {
      _setSelectedMethod(method)
    
      if ((selectedEnvironment !== null) && (method !== null)) {
        const [sample,TABLETYPE] = getJSONData(selectedEnvironment.environment_name,method.method_key)
        setTableType(TABLETYPE)
        const newJsonDataForDB = sample.hasOwnProperty(selectedDataSource["database_name"]) ?  sample[selectedDataSource["database_name"]] : null
        if (newJsonDataForDB == null){
          throw new Error(`(${selectedDataSource["database_name"]}) does not have ${JSON.stringify(selectedEnvironment.environment_name)} | ${JSON.stringify(method.method_key)} data`);
        }
        setJsonDataForDB(sample.hasOwnProperty(selectedDataSource["database_name"]) ?  sample[selectedDataSource["database_name"]] : null)

      }
      
    }
  
  
    return (
      <div className={`${BLOCK_CLASS}__data_sources_panel`} id='data_sources_panel'>
        <div>
          <h2>{selectedDataSource.database_name}</h2>
          {selectedDataSource && (
            <Dropdown
              ariaLabel="Environment Dropdown"
              id="environment-dropdown"
              selectedItem={selectedEnvironment}
              items={selectedDataSource.environments_supported}
              itemToString={(env) => env.environment_name}
              label="Choose Environment"
              titleText="Environment"
              onChange={(item) => {
                setSelectedEnvironment(item.selectedItem);
              }}
            />
          )}
          {selectedEnvironment && (
            <Dropdown
              ariaLabel="Methods Dropdown"
              id="methods-dropdown"
              selectedItem={selectedMethod}
              items={
                selectedProduct === "Guardium Insights SaaS" ||
                selectedProduct === "Guardium Insights (Software)"
                  ? selectedEnvironment.methods_supported.filter(function (e) {
                      return (
                        e.method_key !== "External STAP" &&
                        e.method_key !== "STAP"
                      );
                    })
                  : selectedEnvironment.methods_supported
              }
              itemToString={(env) => env.method_name}
              label="Choose Method"
              titleText="Method"
              onChange={(item) => {
                setSelectedMethod(item.selectedItem);
              }}
            />
          )}

          {selectedMethod && (
            <div>
              <br></br>
              <h6> About {selectedMethod.method_name}</h6>
              <ul>
                <li
                  onClick={() =>
                    setToolTipOpen([
                      !toolTipOpen[0],
                      toolTipOpen[1],
                      toolTipOpen[2],
                    ])
                  }
                  class="tooltip"
                >
                  {" "}
                  How it works
                  {toolTipOpen[0] && (
                    <span class="tooltiptext">
                      {generateAccordianItem(
                        selectedMethod.method_info.filter(
                          (section) =>
                            section.accordian_title == "How it works" &&
                            section.content[0] != null
                        )[0]
                      )}
                    </span>
                  )}
                </li>
                <br></br>

                <li
                  onClick={() =>
                    setToolTipOpen([
                      toolTipOpen[0],
                      !toolTipOpen[1],
                      toolTipOpen[2],
                    ])
                  }
                  class="tooltip"
                >
                  {" "}
                  Benefits and Considerations
                  {toolTipOpen[1] && (
                    <span class="tooltiptext">
                      <h6>Skill Level:</h6>{" "}
                      <div>
                        {" "}
                        {generateAccordianItem(
                          selectedMethod.method_info.filter(
                            (section) =>
                              section.accordian_title == "Skill Level" &&
                              section.content != null
                          )[0]
                        )}
                        <br></br>
                      </div>
                      <div>
                        <h6>Benefits: </h6>{" "}
                        {generateAccordianItem(
                          selectedMethod.method_info.filter(
                            (section) => section.accordian_title == "Benefits"
                          )[0]
                        )}
                        <br></br>
                      </div>
                      <h6>Considerations: </h6>{" "}
                      {generateAccordianItem(
                        selectedMethod.method_info.filter(
                          (section) =>
                            section.accordian_title == "Considerations"
                        )[0]
                      )}
                      <br></br>
                    </span>
                  )}
                </li>
                <br></br>
                <li
                  class="tooltip"
                  onClick={() =>
                    setToolTipOpen([
                      toolTipOpen[0],
                      toolTipOpen[1],
                      !toolTipOpen[2],
                    ])
                  }
                >
                  {" "}
                  Getting Started
                  {toolTipOpen[2] && (
                    <span class="tooltiptext">
                      <h6>Information you will need: </h6>
                      <div>
                        {generateAccordianItem(
                          selectedMethod.method_info.filter(
                            (section) =>
                              section.accordian_title ==
                                "Information you will need" &&
                              section.content[0] != null
                          )[0]
                        )}
                      </div>
                    </span>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>

        {selectedMethod && (
          
            <div class="mainTableWrapper">
            <CompatMatrix
              tableType={tableType}
              initialData={jsonDataForDB}
            />
            </div>
          
        
        )}
      </div>
    );
  }