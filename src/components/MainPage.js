// Main/Landing Page of the application. Displays list of available of data sources in a grid.
// Clicking on a datasource will open up a modal with compatibility information
// for that datasource

import { Loading } from "@carbon/ibm-security";
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
import MainPageDropdown from "./MainPageComponents/MainPageDropDown";
import MainPageHeader from "./MainPageComponents/MainPageHeader";
import { BLOCK_CLASS, PRODUCTS, UNIQUE_OS_NAMES } from "../helpers/consts";
import MainPageMethodDropdown from "./MainPageComponents/MainPageMethodDropDown";
import MainPageOSDropdown from "./MainPageComponents/MainPageOSDropDown";
import {useTooltip} from '../context/TooltipContext';


import "./../styles/connection_doc.scss";

// Import 'supported_databases' and 'methods' from the corresponding files
const { supported_databases } = require(`../data/summary.json`);
const { methods } = require(`../data/MethodsInfo.json`)

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

  // selectedProduct - selected product for filtering datasources
  const [selectedProduct, setSelectedProduct] = useState("All");

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


  const handleClickAnywhere = () => {
    setOpenTooltipId(null); // close any tooltip
  };

  const handleSearchAndFilter = useCallback(() => {
    let searchedConnectionData = handleSearchBar(searchValue, fullConnectionData);
    let filteredConnectionData = handleProductFilter(selectedProduct, searchedConnectionData);
    filteredConnectionData = handleMethodFilter(selectedProduct, selectedMethod, selectedOS, filteredConnectionData);
    
  
    setConnectionData(prevData => 
      JSON.stringify(prevData) !== JSON.stringify(filteredConnectionData) ? filteredConnectionData : prevData
    );
  
    return filteredConnectionData;
  }, [searchValue, selectedProduct, selectedMethod, selectedOS]); 

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
          {/* Filter DropDown */}
          <MainPageDropdown
            PRODUCTS={PRODUCTS}
            // handleSearchAndFilter={handleSearchAndFilter}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
          />
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
