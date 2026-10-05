// Main/Landing Page of the application. Displays list of available of data sources in a grid.
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Loading, Toggle } from "@carbon/ibm-security";
import React, { useState, useEffect, useCallback } from "react";

import {
  handleSearchBar,
  transformDatabaseData,
  handleProductFilter,
  handleMethodFilter,

} from "../helpers/MainPageHelpers/MainPageHelpers";
import DatasourceModal from "./DataSourceModal/DataSourceModal";
import MainPageCard from "./MainPageComponents/MainPageCard";
import MainPageSearchBar from "./MainPageComponents/MainPageSearchBar";
import MainPageHeader from "./MainPageComponents/MainPageHeader";
import MainPageFooter from "./MainPageComponents/MainPageFooter";
import { BLOCK_CLASS, UNIQUE_OS_NAMES } from "../helpers/consts";
import MainPageMethodDropdown from "./MainPageComponents/MainPageMethodDropDown";
import MainPageOSDropdown from "./MainPageComponents/MainPageOSDropDown";
import DropDownLabel from "./MainPageComponents/MainPageDropDownLabel";
import {useTooltip} from '../context/TooltipContext';


import "./../styles/connection_doc.scss";

// Import 'supported_databases' and 'methods' from the corresponding files
const { supported_databases } = require(`../data/summary.json`);
const { methods } = require(`../data/MethodsInfo.json`);
const { datasources: vaDatasources } = require(`../data/VA_datasources.json`);

const methodArray = [
  "All",
  ...Object.values(methods).map((method) => method.method_name),
];

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

  //searchValue - value of searchbar
  const [searchValue, setSearchValue] = useState("");

  //open - Open variable for modal when clicking a DataSourceCard
  const [open, setOpen] = useState(false);

  //show/close tooltip
  const { setOpenTooltipId } = useTooltip();

  //selectedDataSourceData - DataSourceData selected for open modal
  const [selectedDataSourceData, setSelectedDataSourceData] = useState(null);

  const [selectedMethod, setSelectedMethod] = useState("All");

  const [selectedOS, setSelectedOS] = useState("All");

  const [vaOnly, setVaOnly] = useState(false);

  const handleClickAnywhere = () => {
    setOpenTooltipId(null); // close any tooltip
  };

  const handleSearchAndFilter = useCallback(() => {
    let searchedConnectionData = handleSearchBar(searchValue, fullConnectionData);
    let filteredConnectionData = handleProductFilter("All", searchedConnectionData);
    filteredConnectionData = handleMethodFilter("All", selectedMethod, selectedOS, filteredConnectionData);

    if (vaOnly) {
      filteredConnectionData = filteredConnectionData.filter((item) =>
        vaDatasources[item.database_name]?.va_supported === true
      );
    }
  
    setConnectionData(prevData =>
      JSON.stringify(prevData) !== JSON.stringify(filteredConnectionData) ? filteredConnectionData : prevData
    );
  
    return filteredConnectionData;
  }, [searchValue, selectedMethod, selectedOS, vaOnly]);

  useEffect(() => {
    handleSearchAndFilter();
  }, [handleSearchAndFilter]);
  

  return connectionData ? (
    <>
      {/* Main Container when Loaded */}
      <div className="MainPageWrapper" onClick={handleClickAnywhere}>
        <MainPageHeader />
        {/* Divider */}
        <hr className="mainPageDivider" />

        <div className="mainPageTopHolder">
          {/* Search Box */}
          <MainPageSearchBar
            // handleSearchAndFilter={handleSearchAndFilter}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />

          
        </div>
        
        <div className="MainPageFilters">
          <MainPageMethodDropdown
            methods={methodArray}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
          {selectedMethod === "Agent (S-TAP)"?
          (<MainPageOSDropdown
            OSlist={UNIQUE_OS_NAMES}
            selectedOS={selectedOS}
            setSelectedOS={setSelectedOS}/>):null}

          <div className="mainPageDropdown va-toggle-filter">
            <DropDownLabel label="VA (Vulnerability Assessment) support" />
            <Toggle
              id="va-filter-toggle"
              labelA="Off"
              labelB="On"
              toggled={vaOnly}
              onToggle={(checked) => setVaOnly(checked)}
            />
          </div>
        </div>

        

        {/* Divider — above cards */}
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
            selectedProduct="All"
            setOpen={setOpen}
          />
        ): null}
        {/* Divider — above footer */}
        <hr className="mainPageDivider mainPageDividerFooter" />
        <MainPageFooter />
      </div>
    </>
  ) : (
    <Loading />
  );
}
