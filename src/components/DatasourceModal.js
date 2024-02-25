import { Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import React from 'react';
import '../styles/styles.css'
import CompatMatrix2 from "./CompatMatrix2"
import CompatMatrix1 from './CompatMatrix1';
import { tab } from '@testing-library/user-event/dist/tab';
import CompatMatrix from './CompatMatrix';


const BLOCK_CLASS = `connections-doc`;
const getRangeStringFromList = (versionList) => {
  if (versionList == null) {
      return ''; 
    }

  if (versionList.length === 1) {
      return versionList[0];
    } else if (versionList.length > 1) {
      return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
    }
    return '';
}

function compareLists(lsta,lstb) {
  if (lsta.length == lstb.length){

  }
  


}

const TABLE_TYPE_1 = {
  headers: [
  {
    id: 0,
    headerName: "Database Version",
    headerKey: "DatabaseVersion",
    sort: (lsta, lstb) => {
      return getRangeStringFromList(lsta).localeCompare(
        lstb.GUARDIUM_VERSION.toString()
      );
    },
    getReadableString: (lsta) => {
      return getRangeStringFromList(lsta);
    },
  },
  {
    id: 1,
    headerName: "Guardium Version",
    headerKey: "GuardiumVersion",
    sort: (lsta, lstb) => {
      return getRangeStringFromList(lsta).localeCompare(
        lstb.GUARDIUM_VERSION.toString()
      );
    },
    getReadableString: (lsta) => {
      return getRangeStringFromList(lsta);
    },
  },
  {
    id: 2,
    headerName: "OS Version",
    headerKey: "OSVersion",
    sort: (lsta, lstb) => {
      return getRangeStringFromList(lsta).localeCompare(
        lstb.GUARDIUM_VERSION.toString()
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


const TABLE_TYPE_2 = {
  headers: [
    {
      id: 0,
      headerName: "GDP Version",
      headerKey: "GDP_Version",
      sort: (lsta, lstb) => {
        return getRangeStringFromList(lsta).localeCompare(
          lstb.GUARDIUM_VERSION.toString()
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 1,
      headerName: "GI Version",
      headerKey: "GI_Version",
      sort: (lsta, lstb) => {
        return getRangeStringFromList(lsta).localeCompare(
          lstb.GUARDIUM_VERSION.toString()
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 2,
      headerName: "Database Version",
      headerKey: "DataSource_Version",
      sort: (lsta, lstb) => {
        return getRangeStringFromList(lsta).localeCompare(
          lstb.GUARDIUM_VERSION.toString()
        );
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
  
    },
    {
      featureName: "Classification Supported",
      featureKey: "Classification_supported",
  
    },
    {
      featureName: "Download URL",
      featureKey: "Download_URL",
  
    },
    {
      featureName: "ReadMe URL",
      featureKey: "Readme_URL",
  
    },
]
};

const getJSONData = (environment,method) => {
  let key = `${environment}|${method}`
  console.log(`This is the key: ${key}`)
  switch (key){
    case "AWS (Database as a Service)|Amazon Kinesis":
      return [require(`../data/consolidated_csvs/AWS_AmKin.json`),TABLE_TYPE_2]
    case "AWS (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/AWS_ExStap.json`),TABLE_TYPE_2]
    case "AWS (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/AWS_UC.json`),TABLE_TYPE_2]
    case "Azure (Database as a Service)|Azure Event Hubs":
      return [require(`../data/consolidated_csvs/Azure_AzEvHub.json`),TABLE_TYPE_2]
    case "Azure (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/Azure_ExStap.json`),TABLE_TYPE_2]
    case "Azure (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/Azure_UC.json`),TABLE_TYPE_2]
    case "GCP (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/GCP_ExStap.json`),TABLE_TYPE_2]
    case "GCP (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/GCP_UC.json`),TABLE_TYPE_2]
    case "IBM Cloud (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/IBMCloud_ExStap.json`),TABLE_TYPE_2]
    case "IBM Cloud (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_csvs/IBMCloud_UC.json`),TABLE_TYPE_2]
    case "On-premise or IaaS|STAP":
      return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLE_TYPE_1]
    case "On-premise or IaaS|External STAP": //TODO:What is this??
      return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLE_TYPE_1] 
    case "On-premise or IaaS|Universal Connector":
      return [require(`../data/consolidated_csvs/OnPrem_UC.json`),TABLE_TYPE_1]
    case "Oracle Cloud (Database as a Service)|External STAP":
      return [require(`../data/consolidated_csvs/OracleCloud_ExStap.json`),TABLE_TYPE_2]

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
        console.log(`selectedEnvironment: ${selectedEnvironment.environment_name} and selectedMethod :${JSON.stringify(method.method_key)}`)
        const [sample,tableType_] = getJSONData(selectedEnvironment.environment_name,method.method_key)
        setTableType(tableType_)
        const newJsonDataForDB = sample.hasOwnProperty(selectedDataSource["database_name"]) ?  sample[selectedDataSource["database_name"]] : null
        if (newJsonDataForDB == null){
          throw new Error(`(${selectedDataSource["database_name"]}) does not have ${JSON.stringify(selectedEnvironment.environment_name)} | ${JSON.stringify(method.method_key)} data`);
        }
        setJsonDataForDB(sample.hasOwnProperty(selectedDataSource["database_name"]) ?  sample[selectedDataSource["database_name"]] : null)

      }
      
    }
  
  
    return (
      <div className={`${BLOCK_CLASS}__data_sources_panel`}>
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
          <Accordion>
            
              <CompatMatrix
                tableType={tableType}
                initialData={jsonDataForDB}
              />
            
          </Accordion>
        )}
      </div>
    );
  }