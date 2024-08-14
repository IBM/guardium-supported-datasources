// Main/Landing Page of the application. Displays list of available of data sources in a grid.
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Modal, Loading } from "@carbon/ibm-security";
import React, { useState } from "react";

import {
  handleSearchBar,
  transformDatabaseData,
  handleProductFilter,
} from "../helpers/MainPageHelpers/MainPageHelpers";
import DatasourceModal from "./DataSourceModal/DataSourceModal";
import MainPageCard from "./MainPageComponents/MainPageCard";
import MainPageSearchBar from "./MainPageComponents/MainPageSearchBar";
import MainPageDropdown from "./MainPageComponents/MainPageDropDown";
import MainPageLinks from "./MainPageComponents/MainPageLinks";
import { BLOCK_CLASS, PRODUCTS } from "../helpers/consts";
// import "./../styles/styles.css";
import "./../styles/connection_doc.scss";

// Import 'supported_databases' and 'methods' from the connections.json file
const { supported_databases, methods } = require(`../data/connections.json`);

// Map over each 'database' in 'supported_databases' to create a new array 'supportedDabases_with_methodinfo'
const supportedDabases_with_methodinfo = transformDatabaseData(
  supported_databases,
  methods
);

const fullConnectionData = supportedDabases_with_methodinfo;

// Main Page Component
export default function MainPage() {

  //connectionData - Data loaded from json for current display, fullConnectionData filtered based on product filter
  const [connectionData, setConnectionData] = useState(fullConnectionData);

  // selectedProduct - selected product for filtering datasources
  const [selectedProduct, setSelectedProduct] = useState("All");

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState("");

  //open - Open variable for modal when clicking a DataSourceCard
  const [open, setOpen] = useState(false);

  //selectedDataSourceData - DataSourceData selected for open modal
  const [selectedDataSourceData, setSelectedDataSourceData] = useState(null);

  function handleSearchAndFilter(value, selected) {
    value = value ?? searchValue; // Set to current value if unchanged
    selected = selected ?? selectedProduct; // Set to current value if unchanged

    let searchedConnectionData = handleSearchBar(value, fullConnectionData);
    let filteredConnectionData = handleProductFilter(
      selected,
      searchedConnectionData
    );

    // Change Main Page Data based on Filter results
    setConnectionData(filteredConnectionData);
  }

  return connectionData ? (
    <>
      {/* Main Container when Loaded */}
      <div className={`MainPageWrapper`}>
        <MainPageLinks />

        <div className={`mainPageTopHolder`}>
          {/* Search Box */}
          <MainPageSearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleSearchAndFilter={handleSearchAndFilter}
          />

          {/* Filter DropDown */}
          <MainPageDropdown
            handleSearchAndFilter={handleSearchAndFilter}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            PRODUCTS={PRODUCTS}
          />
        </div>

        {/* Divider */}
        <hr className={`mainPageDivider`} />

        {/* All DataSource Cards within Container */}
        <div className={`mainPageCardsContainer`}>
          <div className="bx--row">
            {connectionData.map((dataSourceData) => (
              <MainPageCard
                key={dataSourceData.database_name}
                dataSourceData={dataSourceData}
                setOpen={setOpen}
                setSelectedDataSourceData={setSelectedDataSourceData}
                BLOCK_CLASS={BLOCK_CLASS}
              />
            ))}
          </div>
        </div>

        {selectedDataSourceData && (
          
            <DatasourceModal
              selectedDataSourceData={selectedDataSourceData}
              selectedProduct={selectedProduct}
              setOpen={setOpen}
              open={open}
              
            />
          
        )}
      </div>
    </>
  ) : (
    <Loading />
  );
}
