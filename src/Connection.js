import { AccordionItem, Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link, Search, Modal, Loading, Tag} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';

const BLOCK_CLASS = `connections-doc`;

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

const generateItem = (item) => {
  if (typeof item === "string")
    return <ListItem>{item}</ListItem>
  else if (item.link)
    return <ListItem><Link href={item.link}>{item.title}</Link></ListItem>
  return null
}

const generateOrderListItem = (item) => {
  const generatedItem = generateItem(item);
  if (generatedItem !== null)
    return generatedItem
  else if (item.title && item.content && item.content instanceof Array)
    return (
      <ListItem>
        <OrderedList nested>
          {
            item.map((nestedItem) => (
              generateOrderListItem(nestedItem)
            ))
          }
        </OrderedList>
      </ListItem>
    )
  else
    return null
}

const generateUnorderListItem = (item) => {
  const generatedItem = generateItem(item);
  if (generatedItem !== null)
    return generatedItem
  else if (item.title && item.content && item.content instanceof Array)
    return (
      <ListItem>
        {item.title}
        <UnorderedList nested>
          {item.content.map((nestedItem) => (
            generateUnorderListItem(nestedItem)
          ))}
        </UnorderedList>
      </ListItem>
    )
  else
    return null
}


const generateAccordianItem = (item) => {
  switch (item.type.toLowerCase()) {
    case "string":
      return <div>{item.content}</div>
    case "ordered":
      return (
        <OrderedList>
          {item.content.map((nestedItem) =>
          (
            generateOrderListItem(nestedItem)
          ))}
        </OrderedList>
      )
    case "unordered":
      return (
        <UnorderedList>
          {item.content.map((nestedItem) => (
            generateUnorderListItem(nestedItem)
          ))}
        </UnorderedList>
      )
    case "link":
      return <Link href={item.content.link}>{item.content.title}</Link>
    default:
      return null
  }
}

const checkIfVaSupported = (dataSource) => {
  if (dataSource.va_supported === true) {
    return (
      <div div className={`${BLOCK_CLASS}__list-item-tag`}>
        <Tag>Vulnerability Assessment supported</Tag>
      </div>
    )
  }
  return [];
};

const checkIfClassificationSupported = (dataSource) => {
  if (dataSource.classification_supported === true) {
    return (
      <div div className={`${BLOCK_CLASS}__list-item-tag`}>
        <Tag>Discovery & Classification supported</Tag>
      </div>
    )
  }
  return [];
};

const listGDPSuppVersion = (dataSource) => {
  return (
    <div className={`${BLOCK_CLASS}__list-item-title`}>
      Guardium Data Protection support:
      <div className={`${BLOCK_CLASS}__list-item-text`}>
        Version:&nbsp;&nbsp;{dataSource.gdp_supported_since}+
      </div>
    </div>
  )
};

const listGISuppVersion = (dataSource, selectedMethod) => {
  //Only display GI support info if it's not zero or supported by SaaS

  if (selectedMethod !== null) {
    var selectedMethodName = selectedMethod.method_name;
  }
  // Software AND SaaS are both supported - exlude STAPs E-STAPs
  if (selectedMethodName !== ENVIRONMENT.ESTAP &&
    selectedMethodName !== ENVIRONMENT.STAP &&
    dataSource.supported_since !== '0.0.0' &&
    dataSource.saas_supported) {
    return (
      <div className={`${BLOCK_CLASS}__list-item-title`}>
        Guardium Insights support:
        <div className={`${BLOCK_CLASS}__list-item-text`}>
          Version:&nbsp;&nbsp;SaaS,&nbsp;&nbsp;{dataSource.supported_since}+
        </div>
      </div>
    )
    // SaaS is supported but software is not
  } else if (selectedMethodName !== ENVIRONMENT.ESTAP &&
    selectedMethodName !== ENVIRONMENT.STAP &&
    dataSource.saas_supported &&
    dataSource.supported_since === '0.0.0') {
    return (
      <div className={`${BLOCK_CLASS}__list-item-title`}>
        Guardium Insights support:
        <div className={`${BLOCK_CLASS}__list-item-text`}>
          Version:&nbsp;&nbsp;SaaS
        </div>
      </div>
    )
    // Software is supported but SaaS is not - this shouldn't happen
  } else if (selectedMethodName !== ENVIRONMENT.ESTAP &&
    selectedMethodName !== ENVIRONMENT.STAP &&
    dataSource.supported_since !== '0.0.0') {
    return (
      <div className={`${BLOCK_CLASS}__list-item-title`}>
        Guardium Insights support:
        <div className={`${BLOCK_CLASS}__list-item-text`}>
          Version:&nbsp;&nbsp;{dataSource.supported_since}+
        </div>
      </div>
    )
  } else {
    // do nothing
  }
};

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
  const [selectedProduct, setSelectedProduct] = useState(null);

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

      if (res) {
        // Set constant full data to lookback when filtering
        setFullData(res)
        setConnectionData(res)
        setDisplayDataSources(res.supported_databases)
      }
    }
  }, []);

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
                  selectedItem={undefined}
                  items={PRODUCTS}
                  itemToString={(env) => (env)}
                  label="Select a product"
                  //titleText="Filter based on product"
                  onChange={
                    (item) => {
                      setSelectedProduct(item.selectedItem)
                      filterLogic(selectedProduct)
                    }
                  }
                />
          </div>
        </div>

        <hr className={`${BLOCK_CLASS}__divider`} />
        <div className={`${BLOCK_CLASS}__data-source-container`}>
          <div className="bx--row">{renderDataSourceCards()}</div>
        </div>
        <a className={`${BLOCK_CLASS}__raw-data-link`} href={`${process.env.PUBLIC_URL}/data/connections.json`} target="_blank" rel="noopener noreferrer">Raw Data</a>
        {selectedDataSource && <Modal
          size={'lg'}
          open={open}
          hasScrollingContent={false}
          passiveModal={true}
          onRequestClose={() => {
            setOpen(false)
          }}
        >
          <DatasourceModal selectedDataSource={selectedDataSource} connectionData={connectionData} />
        </Modal>}
      </div>
    </> : <Loading />

  )
}

//DatasourceModal - Component used in modal for info of datasource
export function DatasourceModal({ selectedDataSource, connectionData }) {

  useEffect(() => {
    setSelectedEnvironment(null)
  }, [selectedDataSource]);

  const [selectedEnvironment, _setSelectedEnvironment] = useState(null)

  const [selectedMethod, _setSelectedMethod] = useState(null)

  // const [selectedOtherMethod, setOtherSelectedMethod] = useState(null)

  const setSelectedEnvironment = (environment) => {
    _setSelectedEnvironment(environment)
    setSelectedMethod(null);
  }

  const setSelectedMethod = (method) => {
    _setSelectedMethod(method)
    // setOtherSelectedMethod(null);
  }

  useEffect(() => {
    if (selectedDataSource.environments_supported.length !== 1) return
    const firstEnvironment = selectedDataSource.environments_supported[0]
    setSelectedEnvironment(firstEnvironment);

    if (firstEnvironment.methods_supported.length !== 1) return
    const firstMethod = firstEnvironment.methods_supported[0]
    setSelectedMethod(firstMethod);

    // const otherOptions = getMethodOptions(firstMethod)
    // if (otherOptions.length !== 1) return
    // setOtherSelectedMethod(otherOptions[0]);

  }, [selectedDataSource])

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
              items={selectedEnvironment.methods_supported}
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
        {
          // selectedMethod?.download_url && (
          //   <Link href={selectedMethod.download_url}>[Download]</Link>
          // )
        }
        {
          listGDPSuppVersion(selectedDataSource)
        }
        {
          listGISuppVersion(selectedDataSource, selectedMethod)
        }
        {
          checkIfVaSupported(selectedDataSource)
        }
        {
          checkIfClassificationSupported(selectedDataSource)
        }

      </div>

        {selectedMethod && (
          <Accordion>
            {selectedMethod.supported_versions && (
              <AccordionItem open={true} key={"Data source versions supported"} title={"Data source versions supported"}>
                <div className={`${BLOCK_CLASS}__os-list-item`}>{selectedMethod.supported_versions.join("\r\n")}</div>
              </AccordionItem>
            )}
            {selectedMethod.download_url && (
              <AccordionItem open={true} key={"Plugin download"} title={"Plugin download"}>
                <div>{selectedMethod?.download_url && (<Link href={selectedMethod.download_url}>[Download]</Link>)}</div>
              </AccordionItem>
            )}
            {selectedMethod.supported_operating_systems && (
              <AccordionItem open={true} key={"Operating systems supported"} title={"Operating systems supported"}>
                <div className={`${BLOCK_CLASS}__os-list-item`}>{selectedMethod.supported_operating_systems.join("\r\n")}</div>
              </AccordionItem>
            )}
            {
              selectedMethod.method_info.map((section) => {
                return (
                  <AccordionItem open={false} key={section.accordian_title} title={section.accordian_title}>
                    {generateAccordianItem(section)}
                  </AccordionItem>
                )
              })
            }
          </Accordion>

        )
      }
    </div>
  )
}
