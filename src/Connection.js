import { AccordionItem, Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link, Search, Modal, Loading } from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';


const BLOCK_CLASS = `connections-doc`;

export const ENVIRONMENT = {
  AWS: 'AWS',
  AZURE: 'AZURE',
  UC: 'UC',
  STAP: 'STAP',
  ONPREMISE: 'on-premise',
};

const getMethodOptions = (method) => {
  if (method === ENVIRONMENT.AWS) {
    return ['MANUALLY', 'DISCOVERY'];
  }
  return [];
};

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

  //connectionData - Data loaded from json
  const [connectionData, setConnectionData] = useState(null)

  //open - Open variable for modal when clicking a data source
  const [open, setOpen] = useState(false);

  //selectedDataSource - data source selected for modal
  const [selectedDataSource, _setSelectedDataSource] = useState(null)

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState('');

  //displayDataSources - data sources filtered by version and search value
  const [displayDataSources, setDisplayDataSources] = useState(null);

  //selectedVersion - selected version
  const [selectedVersion, setSelectedVersion] = useState(null);

  const isLoaded = () => {
    return (connectionData && displayDataSources && selectedVersion)
  }


  //Function to sort and check versions
  const versionIsLess = (v1, v2) => {
    var v1 = v1.split(".");
    var v2 = v2.split(".");

    var len = Math.min(v1.length, v2.length);

    for (var i = 0; i < len; i++) {
      if (parseInt(v1[i]) > parseInt(v2[i])) {
        return -1;
      }

      if (parseInt(v1[i]) < parseInt(v2[i])) {
        return 1;
      }
    }
    return 0;
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
      res.versions.sort(versionIsLess)

      if (res) {
        setConnectionData(res)
        setDisplayDataSources(res.supported_databases)

        setSelectedVersion(res.versions[0])
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded())
      handleSearchChange(searchValue);
  }, [searchValue, selectedVersion]);

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

  const renderDataSourceCards = (isGreaterThanVersion) => {
    return displayDataSources.filter((dataSource) => (isGreaterThanVersion ? versionIsLess(dataSource.supported_since, selectedVersion) >= 0 : versionIsLess(dataSource.supported_since, selectedVersion) < 0)).map(dataSource => {
      return dataSourceCard(dataSource, isGreaterThanVersion);
    });
  };

  const dataSourceCard = (dataSource, isGreaterThanVersion) => {
    return (
      <div className={`bx--col-lg-2`}>
        <div
          className={`${BLOCK_CLASS}__data-source-card ` + (!isGreaterThanVersion ? `${BLOCK_CLASS}__data-source-card--disabled` : ``)}
          role="button"
          onClick={isGreaterThanVersion ? () => setSelectedDataSource(dataSource) : null}
          onKeyPress={isGreaterThanVersion ? () => setSelectedDataSource(dataSource) : null}
          tabIndex={0}>
          <div className={`${BLOCK_CLASS}__data-source-card-title`}>{dataSource.database_name}</div>
          <div className={`${BLOCK_CLASS}__data-source-card-version`}>
            v{dataSource.supported_since}+
          </div>
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
            Data sources available in version {selectedVersion}
          </div>
          <div className={`${BLOCK_CLASS}__version-box`}>
            <div className={`${BLOCK_CLASS}__version-title`}>
              Guardium Insights version:
            </div>
            <div className={`${BLOCK_CLASS}__version-dropdown-box`}>
              <Dropdown
                ariaLabel="Version Dropdown"
                id="version-dropdown"
                selectedItem={selectedVersion}
                items={connectionData.versions}
                label="Choose Version"
                onChange={
                  (item) => {
                    setSelectedVersion(item.selectedItem)
                  }
                }
              />
            </div>

          </div>
        </div>

        <hr className={`${BLOCK_CLASS}__divider`} />
        <div className={`${BLOCK_CLASS}__data-source-container`}>
          <div className="bx--row">{renderDataSourceCards(true)}</div>
        </div>
        {selectedVersion !== connectionData.versions[0] && <>
          <div className={`${BLOCK_CLASS}__category_title bx--type-semibold`}>
            Data sources available in latest release (version {connectionData.versions[0]})
          </div>
          <hr className={`${BLOCK_CLASS}__divider`} />
          <div className={`${BLOCK_CLASS}__data-source-container`}>
            <div className="bx--row">{renderDataSourceCards(false)}</div>
          </div>
        </>}
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
          selectedMethod?.download_url && (
            <Link href={selectedMethod.download_url}>[Download]</Link>
          )
        }
        {/* {
          selectedMethod && getMethodOptions(selectedMethod).length > 0 && (
            <Dropdown
              ariaLabel="Other Methods Dropdown"
              id="other-methods-dropdown"
              selectedItem={selectedOtherMethod}
              items={getMethodOptions(selectedMethod)}
              label="Choose Other Method"
              titleText="Other Method"
              onChange={
                (item) => {
                  setOtherSelectedMethod(item.selectedItem)
                }
              }
            />
          )
        } */}
      </div>

      {
        selectedMethod && (
          <Accordion>
            {
              selectedMethod.method_info.map((section) => {
                return (
                  <AccordionItem open={true} key={section.accordian_title} title={section.accordian_title}>
                    {generateAccordianItem(section)}
                  </AccordionItem>
                )
              })
            }
            {selectedMethod.supported_versions && (
              <AccordionItem open={true} key={"Data source versions supported"} title={"Data source versions supported"}>
                <div>{selectedMethod.supported_versions.join(', ')}</div>
              </AccordionItem>
            )}
          </Accordion>

        )
      }
    </div>
  )
}
