// Main/Landing Page of the application. Displays list of available of data sources in a grid.
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Loading } from "@carbon/ibm-security";
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
import MainPageHeader from "./MainPageComponents/MainPageHeader";
import { BLOCK_CLASS, PRODUCTS } from "../helpers/consts";

import "./../styles/connection_doc.scss";

// Import 'supported_databases' and 'methods' from the corresponding files
const { supported_databases } = require(`../data/summary.json`);
const { methods } = require(`../data/MethodsInfo.json`)

// Sort the supported_databases alphabetically by database_name
supported_databases.sort((a, b) =>
  a.database_name.localeCompare(b.database_name)
);

// Map over each 'database' in 'supported_databases' to create a new array 'fullConnectionData'
const fullConnectionData = transformDatabaseData(supported_databases, methods);

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
      searchedConnectionData,
    );

    // Change Main Page Data based on Filter results
    setConnectionData(filteredConnectionData);
  }

  return connectionData ? (
    <>
      {/* Main Container when Loaded */}
      <div className="MainPageWrapper">
        <MainPageHeader />
        

        <div className="mainPageTopHolder">
          {/* Search Box */}
          <MainPageSearchBar
            handleSearchAndFilter={handleSearchAndFilter}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />

          {/* Filter DropDown */}
          <MainPageDropdown
            PRODUCTS={PRODUCTS}
            handleSearchAndFilter={handleSearchAndFilter}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
          />
        </div>

        {/* Divider */}
        <hr className="mainPageDivider" />

        {/* All DataSource Cards within Container */}
        <div className="mainPageCardsContainer">
          <div className="bx--row">
            {connectionData.map((dataSourceData) => (
              <MainPageCard
                BLOCK_CLASS={BLOCK_CLASS}
                dataSourceData={dataSourceData}
                key={dataSourceData.database_name}
                setOpen={setOpen}
                setSelectedDataSourceData={setSelectedDataSourceData}
              />
            ))}
          </div>
        </div>

        {selectedDataSourceData ? (
          <DatasourceModal
            open={open}
            selectedDataSourceData={selectedDataSourceData}
            selectedProduct={selectedProduct}
            setOpen={setOpen}
          />
        ): null}
      </div>
    </>
  ) : (
    <Loading />
  );
}
