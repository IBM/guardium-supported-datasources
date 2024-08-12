
import { EnvironmentDropDown, MethodDropDown } from './EnvironmentDropDown';

// 
import { Dropdown, Accordion, OrderedList, ListItem, UnorderedList, Link} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import React from 'react';
import '../styles/styles.css'
import CompatMatrix from './CompatMatrix';
import {getJSONData} from '../helpers/consts'

import MethodSpecificInfo  from '../components/MethodCollapsibleInfo'


const BLOCK_CLASS = `connections-doc`;




//DatasourceModal - Component used in modal for info of datasource
export default function DatasourceModal({ selectedDataSourceData, selectedProduct }) {
  // Used to populate the main table
  const [jsonDataForDB, setJsonDataForDB] = React.useState(null);

  // Set from dropdowns, determine what to load for jsonDataForDB
  const [selectedEnvironmentData, _setSelectedEnvironmentData] = useState(null);
  const [selectedMethodData, _setSelectedMethodData] = useState(null);

  // Used to load different headers for different data for diffreent env/method
  const [tableType, setTableType] = useState(null);

  // controls tooltip UI
  const [toolTipOpen, setToolTipOpen] = useState([false, false, false]);

  const [loading, setLoading] = useState(true);

  // TODO: Use this error message somehow
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedEnvironmentData(null);
    setJsonDataForDB(null);
  }, [selectedDataSourceData]);

  const setSelectedEnvironmentData = (environment) => {
    _setSelectedEnvironmentData(environment);
    setSelectedMethodData(null);
  };

  const setSelectedMethodData = (method) => {
    _setSelectedMethodData(method);

    // GetJSON Data for DB based on selected Environment and selected Method
    if (selectedEnvironmentData !== null && method !== null) {
      fetchData(selectedEnvironmentData, method);
    }
  };

  const fetchData = (environment, method) => {
    setLoading(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      const [jsonData, tableType] = getJSONData(
        environment.environment_name,
        method.method_key
      );

      // Check if jsonData is found
      if (!jsonData) {
        setErrorMessage(`Data for ${environment.environment_name} | ${method.method_key} could not be loaded.`);
        return;
      }
      // Update the table type state
      setTableType(tableType);

      // Check if the selected database name exists in the jsonData
      const newJsonDataForDB = jsonData.hasOwnProperty(
        selectedDataSourceData["database_name"]
      )
        ? jsonData[selectedDataSourceData["database_name"]]
        : null;

      if (!newJsonDataForDB) {
        setErrorMessage(
          `No data available for ${selectedDataSourceData["database_name"]} in ${environment.environment_name} | ${method.method_key}.`
        );
        return;
      }
      // Update the JSON data state with the relevant data
      setJsonDataForDB(newJsonDataForDB);
    } catch (error) {
      // Handle any errors that occur during data fetching
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data." + error);
    } finally {
      // Set loading state to false after the operation is complete
      setLoading(false);
    }
  };

  return (
    <div
      className={`${BLOCK_CLASS}__data_sources_panel`}
      id="data_sources_panel"
    >
      {/* Div Wrapper for everything but the compatibility matrix/main table  */}
      <div id="non_compat_matix_wrapper">
        {/* Title DB Name */}
        <h2>{selectedDataSourceData.database_name}</h2>

        {/* TODO: Can refactor this DropdownEnvironment Dropwdown */}
        {selectedDataSourceData && (
          <EnvironmentDropDown
            selectedEnvironmentData={selectedEnvironmentData}
            selectedDataSourceData={selectedDataSourceData}
            setSelectedEnvironmentData={setSelectedEnvironmentData}
          />
        )}

        {/*  TODO: Can refactor this Dropdown Method Dropdown */}
        {selectedEnvironmentData && (
          <MethodDropDown
            selectedMethod={selectedMethodData}
            selectedEnvironment={selectedEnvironmentData}
            selectedProduct={selectedProduct}
            setSelectedMethodData={setSelectedMethodData}
          />
        )}

        {selectedMethodData && (
        <MethodSpecificInfo selectedMethodData={selectedMethodData}
        toolTipOpen={toolTipOpen} setToolTipOpen={setToolTipOpen}/>
        )}
      </div>

      {/* Compatibility Matrix */}
      {selectedMethodData && (
        <div class="mainTableWrapper">
          <CompatMatrix tableType={tableType} initialData={jsonDataForDB} />
        </div>
      )}
    </div>
  );


}