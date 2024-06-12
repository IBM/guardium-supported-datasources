// 
import { Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import React from 'react';
import '../styles/styles.css'
import CompatMatrix from './CompatMatrix';
import {getJSONData} from '../helpers/consts'


const BLOCK_CLASS = `connections-doc`;


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
    const [toolTipOpen,setToolTipOpen] = useState([false,false,false]);
  
    useEffect(() => {
      setSelectedEnvironment(null)  
      setJsonDataForDB(null)

    }, [selectedDataSource]);

  
    const setSelectedEnvironment = (environment) => {
      _setSelectedEnvironment(environment)
      setSelectedMethod(null);
    }
  
    const setSelectedMethod = (method) => {
      _setSelectedMethod(method)
    
      // GetJSON Data for DB based on selected Environment and selected Method
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

        {/* Div Wrapper for everything but the compatibility matrix  */}
        <div id="non_compat_matix_wrapper">

          {/* Title DB Name */}
          <h2>{selectedDataSource.database_name}</h2>

          {/* Environment Dropwdown */}
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

          {/* Method Dropdown */}
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

          {selectedMethod && MethodSpecificInfo()}
        </div>

        {/* Compatibility Matrix */}
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

  function MethodSpecificInfo() {
    return <div>
      <br></br>
      <h6> About {selectedMethod.method_name}</h6>
      <ul>
        <li
          onClick={() => setToolTipOpen([
            !toolTipOpen[0],
            toolTipOpen[1],
            toolTipOpen[2],
          ])}
          class="tooltip"
        >
          {" "}
          How it works
          {toolTipOpen[0] && (
            <span class="tooltiptext">
              {generateAccordianItem(
                selectedMethod.method_info.filter(
                  (section) => section.accordian_title == "How it works" &&
                    section.content[0] != null
                )[0]
              )}
            </span>
          )}
        </li>
        <br></br>

        <li
          onClick={() => setToolTipOpen([
            toolTipOpen[0],
            !toolTipOpen[1],
            toolTipOpen[2],
          ])}
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
                    (section) => section.accordian_title == "Skill Level" &&
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
                  (section) => section.accordian_title == "Considerations"
                )[0]
              )}
              <br></br>
            </span>
          )}
        </li>
        <br></br>
        <li
          class="tooltip"
          onClick={() => setToolTipOpen([
            toolTipOpen[0],
            toolTipOpen[1],
            !toolTipOpen[2],
          ])}
        >
          {" "}
          Getting Started
          {toolTipOpen[2] && (
            <span class="tooltiptext">
              <h6>Information you will need: </h6>
              <div>
                {generateAccordianItem(
                  selectedMethod.method_info.filter(
                    (section) => section.accordian_title ==
                      "Information you will need" &&
                      section.content[0] != null
                  )[0]
                )}
              </div>
            </span>
          )}
        </li>
      </ul>
    </div>;
  }
}