// Main/Landing Page of the application. Displays list of available of data sources in a grid.
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Modal, Loading } from "@carbon/ibm-security";
import React, { useEffect, useState } from "react";
import "./styles/styles.css";

import {fuzzySearchV2} from "./helpers/helpers";
import DatasourceModal from "./components/DatasourceModal";
import DataSourceCard from './components/DataSourceCard'
import DataSourceSearchInput from "./components/DataSourceSearchInput";
import DataSourcesFilterDropdown from "./components/DataSourcesFilterDropDown";
import LinksDiv from "./components/LinksComponent";

// TODO: Move constants to one file
// CONSTANTS
const BLOCK_CLASS = `connections-doc`;

export const PRODUCTS = [
  "All",
  "Guardium Data Protection",
  "Guardium Insights (Software)",
  "Guardium Insights SaaS",
];

// Main Page Component
export default function MainPage() {
  // fullData - complete unfiltered data loaded from json
  const [fullConnectionData, setFullConnectionData] = useState(null);

  //connectionData - Data loaded from json for current display, fullConnectionData filtered based on product filter
  const [connectionData, setConnectionData] = useState(null);

  // selectedProduct - selected product for filtering datasources
  const [selectedProduct, setSelectedProduct] = useState("All");

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState("");

  //open - Open variable for modal when clicking a DataSource
  const [open, setOpen] = useState(false);

  //selectedDataSourceData - DataSourceData selected for modal
  const [selectedDataSourceData, setSelectedDataSourceData] = useState(null);

  
  const fetchData = () => {
    if (!(connectionData)) {

      // Import 'supported_databases' and 'methods' from the connections.json file
      const { supported_databases, methods } = require(`./data/connections.json`);

      // Map over each 'database' in 'supported_databases' to create a new array 'supportedDabases_with_methodinfo'
      const supportedDabases_with_methodinfo = transformDatabaseData(supported_databases, methods);

      // Directly set the state without using resCopy
      setFullConnectionData(() => supportedDabases_with_methodinfo);
      setConnectionData(() => supportedDabases_with_methodinfo);
    }
  };

  function transformDatabaseData(supported_databases, methods) {
    return supported_databases.map((database) => ({
      // Spread operator to copy all properties of the current 'database' object
      ...database,

      // Map over each 'environment' in 'environments_supported' array
      environments_supported: database.environments_supported.map(
        (environment) => ({
          // Spread operator to copy all properties of the current 'environment' object
          ...environment,

          // Map over each 'method' in 'methods_supported' array
          methods_supported: environment.methods_supported.map(
            (method) => ({
              // Spread operator to copy all properties of the current 'method' object
              ...method,

              // Merge method data with additional information from 'methods' using 'method_key'
              ...methods[method.method_key]
            })
          ),
        })
      ),
    }));
  }

  useEffect(() => {
    
    fetchData();
  
  }, []);
  

  

  function handleSearchChange(value = searchValue, selected=selectedProduct) {
    
    const fuzzyOptionsOverride = {
      threshold: 0.25, // closer to 0 improves the quality of the match.
      ignoreLocation: true, // find matches anywhere
      includeMatches: false, // return the matched text
    };

    let filteredChecklist = value
      ? fuzzySearchV2(
          value,
          fullConnectionData,
          [
            "database_name",
            "environments_supported.environment_name",
            "environments_supported.methods_supported.method_name",
          ],
          fuzzyOptionsOverride
      )
    : fullConnectionData;


    switch (selected) {
      case "All":
          break;
      case "Guardium Data Protection":
        filteredChecklist = filteredChecklist.filter(
          (elem) => elem.gdp_supported_since !== undefined
          );
          break;
      case "Guardium Insights (Software)":
        filteredChecklist = filteredChecklist.filter(
          (elem) =>
              elem.supported_since !== "0.0.0" &&
              !elem.supported_since.includes("Planned for")
          );
          break;
      case "Guardium Insights SaaS":
        filteredChecklist = filteredChecklist.filter(
          (elem) => elem.saas_supported !== undefined
          );
          break;
      default:
          break;
      }

      // Change Main Page Data based on Filter results
      setConnectionData(filteredChecklist);

      
  };

  const renderMultipleDataSourceCards = () => {
    return connectionData.map((dataSourceData) => (
      <DataSourceCard
        key={dataSourceData.database_name}
        dataSourceData={dataSourceData}
        setOpen={setOpen}
        setSelectedDataSourceData={setSelectedDataSourceData}
        BLOCK_CLASS={BLOCK_CLASS}
      />
    ));
  };

  return (connectionData) ? (
    <>
      {/* Main Container when Loaded */}
      <div
        className={`${BLOCK_CLASS}__main-content`}
        id="add-datasource-tearsheet-content"
      >
        {/* TODO: Refactor links_div */}
        <LinksDiv blockClass={BLOCK_CLASS}/>

        {/* Search Box */}
        <DataSourceSearchInput searchValue={searchValue} setSearchValue={setSearchValue} handleSearchChange={handleSearchChange} BLOCK_CLASS={BLOCK_CLASS}/>

        {/* Filter DropDown */}
        <DataSourcesFilterDropdown handleSearchChange={handleSearchChange} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} setConnectionData={setConnectionData} connectionData={connectionData} PRODUCTS={PRODUCTS} BLOCK_CLASS={BLOCK_CLASS}/>

        {/* Divider */}
        <hr className={`${BLOCK_CLASS}__divider`} />

        {/* All DataSource Cards within Container */}
        <div className={`${BLOCK_CLASS}__data-source-container`}>
          <div className="bx--row">{renderMultipleDataSourceCards()}</div>
        </div>

        {/* TODO: Can refactor this <Modal> DataSource Modal open when click on DataSource Card */}
        {selectedDataSourceData && (
          <Modal
            size={"lg"}
            open={open}
            hasScrollingContent={false}
            passiveModal={true}
            onRequestClose={() => {
              setOpen(false);
            }}
          >
            <DatasourceModal
              selectedDataSourceData={selectedDataSourceData}
              selectedProduct={selectedProduct}
            />
          </Modal>
        )}
      </div>
    </>
  ) : (
    <Loading />
  );
}
