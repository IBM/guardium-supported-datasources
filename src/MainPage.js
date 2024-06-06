// Main/Landing Page of the application. Displays list of available of data sources in a grid. 
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Dropdown, Search, Modal, Loading, Button} from '@carbon/ibm-security';
import { useEffect, useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import React from 'react';
import './styles/styles.css'
import { DatasourceModal } from './components/DatasourceModal';


// CONSTANTS
const BLOCK_CLASS = `connections-doc`;

export const PRODUCTS = ['All',
  'Guardium Data Protection',
  'Guardium Insights (Software)',
  'Guardium Insights SaaS']


// Helper function to do string search
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


// Main Page Component
export default function MainPage() {

  // fullData - complete unfiltered data loaded from URL
  const [fullData, setFullData] = useState(null);

  //connectionData - Data loaded from json for current display
  const [connectionData, setConnectionData] = useState(null)

  //open - Open variable for modal when clicking a DataSource
  const [open, setOpen] = useState(false);

  //selectedDataSource - DataSource selected for modal
  const [selectedDataSource, _setSelectedDataSource] = useState(null)

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState('');

  //displayDataSources - DataSources filtered by version and search value
  const [displayDataSources, setDisplayDataSources] = useState(null);

  // selectedProduct - selected product for filtering datasources
  const [selectedProduct, setSelectedProduct] = useState('All');

  const isLoaded = () => {
    return (connectionData && displayDataSources)
  }

  // Apply filter logic based on option chosen from Dropdown
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

    // Change Main Page Data based on Filter results
    setConnectionData(ret);
    setDisplayDataSources(ret.supported_databases);

  }

  // Helper Functions for Filtering using Dropdown
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


  useEffect(async () => {
    if (!isLoaded()) {
      let res = require(`./data/connections.json`);

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
      resCopy.supported_databases = res.supported_databases//.filter((database) => DATABASE_LIST_V2.includes(database.database_name))

      if (resCopy) {

        // Set constant full data to lookback when filtering
        setFullData(resCopy)
        setConnectionData(resCopy)
        setDisplayDataSources(resCopy.supported_databases)
      }
    } else {
      handleSearchChange(searchValue);
    }
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

  // Handles display of DataSource Modal
  const setSelectedDataSource = (dataSource) => {
    setOpen(true);
    _setSelectedDataSource(dataSource);
  }

  const renderDataSourceCards = () => {
    return displayDataSources.map(dataSource => {
      return dataSourceCard(dataSource);
    });
  };

  // Datasouce Card Modal UI component
  const dataSourceCard = (dataSource) => {
    return (
      <div className={`bx--col-lg-2`}>
        <div
          className={`${BLOCK_CLASS}__data-source-card`}
          role="button"
          onClick={() => setSelectedDataSource(dataSource)}
          tabIndex={0}>
          <div className={`${BLOCK_CLASS}__data-source-card-title`}>{dataSource.database_name}</div>
        </div>
      </div>
    );
  };

  // DataSource search inputbox component
  const dataSourceSearchInput = () => {
    const searchColumnProps = () => ({
      id: 'search-columns',
      size: 'xl',
      light: false,
      name: 'search-columns',
      defaultValue: '',
      labelText: "Find a DataSource",
      placeholder: "Find a DataSource",
      value: searchValue,
      onChange: event => setSearchValue((event.target && event.target.value) || event.value),
    });
    return <Search className={`${BLOCK_CLASS}__search`} {...searchColumnProps()} />;
  };

// DataSource filter dropdown component
  function DataSourcesFilterDropdown() {
    return <div className={`${BLOCK_CLASS}__header-box`}>
      <div className={`${BLOCK_CLASS}__category_title bx--type-semibold`}>
        DataSources supported by Guardium
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
          onChange={(item) => {
            setSelectedProduct(item.selectedItem);
            filterLogic(item.selectedItem);
          } } />
      </div>
    </div>;
  }

  return (
    (isLoaded()) ? <>
    {/* Main Container when Loaded */}
      <div
        className={`${BLOCK_CLASS}__main-content`}
        id="add-datasource-tearsheet-content">


      <div className='links_div'>
      <a className={`${BLOCK_CLASS}__raw-data-link`} href={`./data/connections.json`} target="_blank" rel="noopener noreferrer">Raw Data</a>

      <a className={`${BLOCK_CLASS}__raw-data-link`} href="https://github.com/AhmedMujtabaIBM/guardium-supported-datasources-v2/issues/new"  target="_blank" rel="noopener noreferrer">Report An Issue</a>
      
      </div>

          {/* Search Box */}
        {dataSourceSearchInput()}

        {/* Filter DropDown */}
        {DataSourcesFilterDropdown()}

        {/* Divider */}
        <hr className={`${BLOCK_CLASS}__divider`} />

        {/* All DataSource Cards within Container */}
        <div className={`${BLOCK_CLASS}__data-source-container`}>
          <div className="bx--row">{renderDataSourceCards()}</div>
        </div>


        {/* DataSource Modal open when click on DataSource Card */}
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


