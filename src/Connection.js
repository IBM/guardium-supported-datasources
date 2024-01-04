import { AccordionItem, Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link, Search, Modal, Loading} from '@carbon/ibm-security';
import { useEffect, useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import ExpandingTableRow from './ExpandingTableRow';

import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './styles/styles.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const BLOCK_CLASS = `connections-doc`;
const DATABASE_LIST_V2 = ['SAP HANA', 'MySQL', 'Netezza', 'Oracle Exadata', ' sixtyfour-bit', 'Oracle RAC', 'Sybase IQ', 'MariaDB', 'Oracle', 'Sybase ASE', 'Informix', 'Aster', 'Cloudera', 'Couch', 'Db2', 'Greenplum', 'Hortonworks', 'MemSQL', 'Vertica', 'Cassandra', 'Cassandra / Datastax', 'PostgreSQL', 'Teradata', 'Db2 Purescale', 'MongoDB', 'Sailfish', 'Cassandra Apache', 'Couchbase', 'Neo4j', 'MS SQL Server', 'Datasets for z/OS', 'IBM DB2 for z/OS', 'IMS for z/OS', 'DB2 Purescale', 'Redis', 'Elasticsearch', 'MS SQL Server Cluster', 'MS SQL Server Always On', 'CockroachDB', 'S3', 'HDFS', 'DynamoDB', 'Snowflake']
export const ENVIRONMENT = {
  AWS: 'AWS',
  AZURE: 'AZURE',
  UC: 'UC',
  ESTAP: 'External S-TAP',
  STAP: 'Agent (S-TAP)',
  ONPREMISE: 'on-premise',
};

export const PRODUCTS = ['All',
  'Guardium Data Protection',
  'Guardium Insights (Software)',
  'Guardium Insights SaaS']

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

const fuzzySearchV2 = (term, list, keys, otherOptions) => {
  const options = {
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: term.length * 0.51,
    keys: [...keys],
    ...otherOptions,
  };

  const fuse = new Fuse(list, options);

  let result = fuse.search(term);

  // Option to return the matched text which the caller would need to  highlight the matched text
  const includeMatches = options['includeMatches'];

  if (result.length > 0 && !includeMatches) {
    result = result.map(r => r.item);
  }

  return result;
};


// Main Connections Component
export default function Connection() {

  // fullData - complete unfiltered data loaded from URL
  const [fullData, setFullData] = useState(null);

  //connectionData - Data loaded from json for current display
  const [connectionData, setConnectionData] = useState(null)

  //open - Open variable for modal when clicking a data source
  const [open, setOpen] = useState(false);

  //selectedDataSource - data source selected for modal
  const [selectedDataSource, _setSelectedDataSource] = useState(null)

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState('');

  //displayDataSources - data sources filtered by version and search value
  const [displayDataSources, setDisplayDataSources] = useState(null);

  // selectedProduct - selected product for filtering datasources
  const [selectedProduct, setSelectedProduct] = useState('All');

  const isLoaded = () => {
    return (connectionData && displayDataSources)
  }

  // Filter to only SaaS
  const filterSaaS = (res) => {
    // If property "saas_supported" exists
    res.supported_databases = res.supported_databases.filter((elem) =>  elem.saas_supported !== undefined)
    return res

  }

  //Filter to only Insights Software (On-Prem)
  const filterInsights = (res) => {
    // If property "supported_since" !== "0.0.0" and property "supported_since" does not include "Planned for"
    res.supported_databases = res.supported_databases.filter((elem) => elem.supported_since !== "0.0.0" && !elem.supported_since.includes("Planned for"))
    return res
  }

  // Filter to only Guardium Data Protection
  const filterGDP = (res) => {
    // If propery "gdp_supported_since" exists
    res.supported_databases = res.supported_databases.filter((elem) => elem.gdp_supported_since !== undefined)
    return res
  }

  // Apply filter based on option chosen from Dropdown
  const filterLogic = (selected) => {
    var ret = JSON.parse(JSON.stringify(fullData));
    switch (selected) {
      case 'All':
        break;
      case 'Guardium Data Protection':
        ret = filterGDP(ret);
        break;
      case 'Guardium Insights (Software)':
        ret = filterInsights(ret);
        break;
      case  'Guardium Insights SaaS':
        ret = filterSaaS(ret);
        break;
      default:
        break;
    }

    setConnectionData(ret);
    setDisplayDataSources(ret.supported_databases);

  }


  //Used to load data from json. This is because connections.json is hosted in public folder for public access, hence unable to import directly
  useEffect(async () => {
    if (!isLoaded()) {
      let res = await (await fetch(`${process.env.PUBLIC_URL}/data/connections.json`)).json();

      //Join method by key. Allows for search by method name in turn for a little of performance
      res.supported_databases = res.supported_databases.map(
        (database) => {
          database.environments_supported = database.environments_supported.map(
            (environment) => {
              environment.methods_supported = environment.methods_supported.map(
                (method) => ({ ...method, ...res.methods[method.method_key] })
              )
              return environment
            })
          return database
        }
      )

      let resCopy = {}
      resCopy.supported_databases = res.supported_databases.filter((database) => DATABASE_LIST_V2.includes(database.database_name))

      if (resCopy) {

        // Set constant full data to lookback when filtering
        setFullData(resCopy)
        setConnectionData(resCopy)
        setDisplayDataSources(resCopy.supported_databases)
      }
    }
  });

  useEffect(() => {
    if (isLoaded())
      handleSearchChange(searchValue);
  }, [searchValue]);

  const handleSearchChange = (value = '') => {

    const fuzzyOptionsOverride = {
      threshold: 0.25, // closer to 0 improves the quality of the match.
      ignoreLocation: true, // find matches anywhere
      includeMatches: false, // return the matched text
    };

    const filteredChecklist = value
      ? fuzzySearchV2(value, connectionData.supported_databases, ['database_name', 'environments_supported.environment_name', 'environments_supported.methods_supported.method_name'], fuzzyOptionsOverride)
      : connectionData.supported_databases;
    setDisplayDataSources(filteredChecklist);
  };

  const setSelectedDataSource = (dataSource) => {
    setOpen(true);
    _setSelectedDataSource(dataSource);
  }

  const renderDataSourceCards = () => {
    return displayDataSources.map(dataSource => {
      return dataSourceCard(dataSource);
    });
  };

  const dataSourceCard = (dataSource) => {
    return (
      <div className={`bx--col-lg-2`}>
        <div
          className={`${BLOCK_CLASS}__data-source-card`}
          role="button"
          onClick={true ? () => setSelectedDataSource(dataSource) : null}
          onKeyPress={true ? () => setSelectedDataSource(dataSource) : null}
          tabIndex={0}>
          <div className={`${BLOCK_CLASS}__data-source-card-title`}>{dataSource.database_name}</div>
        </div>
      </div>
    );
  };

  // data source search inputbox
  const dataSourceSearchInput = () => {
    const searchColumnProps = () => ({
      id: 'search-columns',
      size: 'xl',
      light: false,
      name: 'search-columns',
      defaultValue: '',
      labelText: "Find a data source",
      placeholder: "Find a data source",
      value: searchValue,
      onChange: event => setSearchValue((event.target && event.target.value) || event.value),
    });
    return <Search className={`${BLOCK_CLASS}__search`} {...searchColumnProps()} />;
  };

  return (
    (isLoaded()) ? <>
      <div
        className={`${BLOCK_CLASS}__main-content`}
        id="add-datasource-tearsheet-content">
        {dataSourceSearchInput()}
        <div className={`${BLOCK_CLASS}__header-box`}>
          <div className={`${BLOCK_CLASS}__category_title bx--type-semibold`}>
            Data sources supported by Guardium
          </div>
          <div className={`${BLOCK_CLASS}__version-dropdown-box`}>
            <Dropdown
                  ariaLabel="Products Dropdown"
                  id="products-dropdown"
                  selectedItem={selectedProduct}
                  items={PRODUCTS}
                  itemToString={(env) => (env)}
                  label="Select a product"
                  //titleText="Filter based on product"
                  onChange={
                    (item) => {
                      setSelectedProduct(item.selectedItem)
                      filterLogic(item.selectedItem)
                    }
                  }
                />
          </div>
        </div>

        <hr className={`${BLOCK_CLASS}__divider`} />
        <div className={`${BLOCK_CLASS}__data-source-container`}>
          <div className="bx--row">{renderDataSourceCards()}</div>
        </div>
        <a className={`${BLOCK_CLASS}__raw-data-link`} href={`./data/connections.json`} target="_blank" rel="noopener noreferrer">Raw Data</a>
        {selectedDataSource && <Modal
          size={'lg'}
          open={open}
          hasScrollingContent={false}
          passiveModal={true}
          onRequestClose={() => {
            setOpen(false)
          }}
        >
          <DatasourceModal selectedDataSource={selectedDataSource} connectionData={connectionData} selectedProduct={selectedProduct} />
        </Modal>}
      </div>
    </> : <Loading />

  )
}

function CompatMatrix({rowData}) {

  

  const [currentRowData, setCurrentRowData] = useState(rowData);
  const [currentSortedDB, setCurrentSortedDB] = useState(-1)
  const [currentSortedGuardium, setCurrentSortedGuardium] = useState(-1)
  const [currentSortedOS, setCurrentSortedOS] = useState(-1)

  

  useEffect(() => {
  },[JSON.stringify(currentRowData),currentRowData[0]]);
  
  
  const sortByOSVersion = () => {
    let newData = []
    
    newData = [...currentRowData].sort(compareByOSVersions)
    setCurrentRowData([...newData])

    if (currentSortedOS == -1) {
      setCurrentSortedOS(1)
    } else {
      setCurrentSortedOS(-1)
    }
    
  }

  const sortByGuardiumVersion = () => {
    let newData = []
    
    newData = [...currentRowData].sort(compareByGuardiumVersion)
    setCurrentRowData([...newData])

    if (currentSortedGuardium == -1) {
      setCurrentSortedGuardium(1)
    } else {
      setCurrentSortedGuardium(-1)
    }
    
  }
  
  
  const sortByDBVersion = () => {
    let newData = []

    if (currentSortedDB == -1) {
      newData = [...currentRowData].sort((a, b) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
      setCurrentRowData([...newData])
      setCurrentSortedDB(1)
    } else {
      newData = [...currentRowData].sort((b, a) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
      setCurrentRowData([...newData])
      setCurrentSortedDB(-1)
    }
    
  }


  function compareByOSVersions(a, b) {
    if (currentSortedOS == -1) {
    return a.OS_VERSIONS.toString().localeCompare(b.OS_VERSIONS.toString());
  } else {
    return b.OS_VERSIONS.toString().localeCompare(a.OS_VERSIONS.toString());
  }
}

function compareByGuardiumVersion(a, b) {
  
  if (currentSortedGuardium == -1) {
    return a.GUARDIUM_VERSION.toString().localeCompare(b.GUARDIUM_VERSION.toString());
  } else {
    return b.GUARDIUM_VERSION.toString().localeCompare(a.GUARDIUM_VERSION.toString());
  }
}

function compareByDBVersion(a, b) {
  
  if (currentSortedDB == -1) {
    return a.DB_VERSIONS.toString().split("-")[0].localeCompare(b.DB_VERSIONS.toString().split("-")[0]);
  } else {
    return b.DB_VERSIONS.toString().split("-")[0].localeCompare(a.DB_VERSIONS.toString().split("-")[0]);
  }
}
  
  return (

    <AccordionItem open={true} key={"Detailed Support Information"} title={"Detailed Support Information"}>
              
                        
                          <table >
                            <thead class='matrixheader'>
                              <tr>
                              <th className="uk-table-shrink"></th >
                                
                                <th class="dataheadercell" onClick={sortByDBVersion}>
                                        Database<br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedDB!=1)} />
                                    
                                  </th>
                                  <th class="dataheadercell" onClick={sortByGuardiumVersion}>
                                    Guardium <br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedGuardium!=1)} />
                                  </th>
                                  <th class="dataheadercell" onClick={sortByOSVersion} style={{whiteSpace:"pre-wrap"}}>
                                    OS<br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedOS!=1)} />
                                  </th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRowData.map((row) => (
                                
                                <ExpandingTableRow user={row} opened={false}/>
                                
                      
                              ))}
                            </tbody>
                          </table>
                        
                      
              </AccordionItem>

                              
  )

}

//DatasourceModal - Component used in modal for info of datasource
export function DatasourceModal({ selectedDataSource, connectionData, selectedProduct }) {
  const sample = require(`./data/supported_dbs.json`);
  
  var rowData = sample.hasOwnProperty(selectedDataSource["database_name"]) ?  sample[selectedDataSource["database_name"]] : null
  

  useEffect(() => {
    setSelectedEnvironment(null)
    
  }, [selectedDataSource]);

  const [selectedEnvironment, _setSelectedEnvironment] = useState(null)

  const [selectedMethod, _setSelectedMethod] = useState(null)

  const [count, setCount] = useState(0); 


  const [toolTipOpen,setToolTipOpen] = useState([false,false,false]);

  // const [selectedOtherMethod, setOtherSelectedMethod] = useState(null)

  const setSelectedEnvironment = (environment) => {
    _setSelectedEnvironment(environment)
    setSelectedMethod(null);
  }

  const setSelectedMethod = (method) => {
    _setSelectedMethod(method)
    // setOtherSelectedMethod(null);
  }


  return (
    <div className={`${BLOCK_CLASS}__data_sources_panel`}>
      <div>
        <h2>{selectedDataSource.database_name}</h2>
        {
          selectedDataSource && (
            <Dropdown
              ariaLabel="Environment Dropdown"
              id="environment-dropdown"
              selectedItem={selectedEnvironment}
              items={selectedDataSource.environments_supported}
              itemToString={(env) => (env.environment_name)}
              label="Choose Environment"
              titleText="Environment"
              onChange={
                (item) => {
                  setSelectedEnvironment(item.selectedItem)
                }
              }
            />
          )
        }
        {
          selectedEnvironment && (
            <Dropdown
              ariaLabel="Methods Dropdown"
              id="methods-dropdown"
              selectedItem={selectedMethod}
              items={selectedProduct === "Guardium Insights SaaS" || selectedProduct === 'Guardium Insights (Software)' ? selectedEnvironment.methods_supported.filter(function(e) {return e.method_key !== 'External STAP' && e.method_key !== 'STAP' }) : selectedEnvironment.methods_supported}
              itemToString={(env) => (env.method_name)}
              label="Choose Method"
              titleText="Method"
              onChange={
                (item) => {
                  setSelectedMethod(item.selectedItem)
                }
              }
            />
          )
        }
        
        
        { selectedMethod && (
          <div>
            <br></br>
            <h6> About {selectedMethod.method_name}</h6>
            <ul>
              
              <li onClick={() => setToolTipOpen([!toolTipOpen[0],toolTipOpen[1],toolTipOpen[2]])}  class="tooltip"> How it works
              {toolTipOpen[0] && <span class="tooltiptext">{
              generateAccordianItem(selectedMethod.method_info.filter((section) => (section.accordian_title == "How it works" && section.content[0] != null))[0])} 
              </span>
              }
              </li>
              <br></br>

              <li onClick={() => setToolTipOpen([toolTipOpen[0],!toolTipOpen[1],toolTipOpen[2]])}   class="tooltip"> Benefits and Considerations
              {toolTipOpen[1] && (
              <span class="tooltiptext">
              <h6>Skill Level:</h6> <div> {
              generateAccordianItem(selectedMethod.method_info.filter((section) => (section.accordian_title == "Skill Level" && section.content != null))[0])} 
              <br></br>
              </div>
              

              <div><h6>Benefits: </h6> {
              generateAccordianItem(selectedMethod.method_info.filter((section) => (section.accordian_title == "Benefits"))[0])} 
              <br></br>
              </div>

              <h6>Considerations: </h6> {
              generateAccordianItem(selectedMethod.method_info.filter((section) => (section.accordian_title == "Considerations"))[0])} 
              <br></br>




              </span>)}

                </li>
                <br></br>
                <li class="tooltip" onClick={() => setToolTipOpen([toolTipOpen[0],toolTipOpen[1],!toolTipOpen[2]])} > Getting Started
                {toolTipOpen[2] && ( <span class="tooltiptext">
                  
                  <h6>Information you will need: </h6>
                  <div>
                  {  
                  generateAccordianItem(selectedMethod.method_info.filter((section) => (section.accordian_title == "Information you will need" && section.content[0] != null))[0])} 
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

            { <CompatMatrix rowData={rowData}/>}
          </Accordion>
        )
      }
    </div>
  )
}
