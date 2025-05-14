import { useEffect, useState } from "react";
import React from "react";
import PropTypes from "prop-types";
import { Loading, Modal } from "@carbon/ibm-security";

import {
  EnvironmentDropDown,
  MethodDropDown,
} from "./ModalLeftPanel/PanelDropDowns";
import ModalMainPanel from "./ModalMainPanel/ModalMainPanel";
import PanelCollapsibleInfo from "./ModalLeftPanel/PanelCollapsibleInfo";
import { getJSONData, BLOCK_CLASS } from "../../helpers/consts";

//DatasourceModal - Component used in modal for info of datasource
export default function DatasourceModal({
  selectedDataSourceData,
  selectedProduct,
  setOpen,
  open,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Set from dropdowns, determine what to load for jsonDataForDB
  const [selectedEnvironmentData, _setSelectedEnvironmentData] = useState(null);
  const [selectedMethodData, _setSelectedMethodData] = useState(null);

  // Used to populate the main table
  const [jsonDataForDB, setJsonDataForDB] = React.useState(null);
  // Used to load different headers,depends on diffreent env/method
  const [tableType, setTableType] = useState(null);

  // controls tooltip UI
  const [toolTipOpen, setToolTipOpen] = useState([false, false, false]);

  const setSelectedEnvironmentData = (environment) => {
    _setSelectedEnvironmentData(environment);
    setSelectedMethodData(null);
  };

  const setSelectedMethodData = (method) => {
    _setSelectedMethodData(method);

    // GetJSON Data for DB based when selected Environment and selected Method
    if (selectedEnvironmentData && method) {
      fetchData(selectedEnvironmentData, method);
    }
  };

  useEffect(() => {
    setSelectedEnvironmentData(null);
    setJsonDataForDB(null);
  }, [selectedDataSourceData]); // Reset dropdown and JSON data when new datasource changed

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
        setErrorMessage(
          `Data for ${environment.environment_name} | ${method.method_key} could not be loaded.`
        );
        // Set error states
        setJsonDataForDB(null);
        setTableType(0);
        return;
      }

      // Check if the selected database name exists in the jsonData
      const newJsonDataForDB = Object.prototype.hasOwnProperty.call(
        jsonData,
        selectedDataSourceData["database_name"]
      )
        ? jsonData[selectedDataSourceData["database_name"]]
        : null;

      if (!newJsonDataForDB) {
        setErrorMessage(
          `No data available for ${selectedDataSourceData["database_name"]} in ${environment.environment_name} | ${method.method_key}.`
        );
        // Set error states
        setJsonDataForDB(null);
        setTableType(0);
        return;
      }
      // Update the JSON data state with the relevant data
      setJsonDataForDB(newJsonDataForDB);

      console.log("newJsonDataForDB:", newJsonDataForDB);

      
      // Update the table type state
      setTableType(tableType);
    } catch (error) {
      // Handle any errors that occur during data fetching
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data." + error);
      // Set error states
      setJsonDataForDB(null);
      setTableType(0);
    } finally {
      // Set loading state to false after the operation is complete
      setLoading(false);
    }
  };


  console.log("selectedDataSourceData:", selectedDataSourceData);
  return loading ? (
    <Loading />
  ) : (
    <Modal
      size="lg"
      open={open}
      hasScrollingContent={false}
      passiveModal={true}
      onRequestClose={() => {
        setOpen(false);
      }}
    >
      <div className={`${BLOCK_CLASS}__inside_modal_wrapper`}>
        {/* Div Wrapper for left panel  */}
        <div className={`${BLOCK_CLASS}__modal_left_panel`}>
          {/* Title DB Name */}
          <h2>{selectedDataSourceData.database_name}</h2>

          {selectedDataSourceData ? (
            <EnvironmentDropDown
              selectedEnvironmentData={selectedEnvironmentData}
              selectedDataSourceData={selectedDataSourceData}
              setSelectedEnvironmentData={setSelectedEnvironmentData}
            />
          ) : null}

          {selectedEnvironmentData ? (
            <MethodDropDown
              selectedMethodData={selectedMethodData}
              selectedEnvironmentData={selectedEnvironmentData}
              selectedProduct={selectedProduct}
              setSelectedMethodData={setSelectedMethodData}
            />
          ) : null}

          {selectedMethodData ? (
            <PanelCollapsibleInfo
              selectedMethodData={selectedMethodData}
              toolTipOpen={toolTipOpen}
              setToolTipOpen={setToolTipOpen}
            />
          ) : null}
        </div>

        <div className={`${BLOCK_CLASS}__modal_main_panel_wrapper`}>
          {selectedMethodData && tableType != 0 && jsonDataForDB ? (
            <ModalMainPanel
              tableType={tableType}
              jsonDataForDB={jsonDataForDB}
              special_notes={selectedMethodData.special_notes}
            />
          ) : (
            errorMessage !== "" && <p>Error: {errorMessage}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// PropTypes validation
DatasourceModal.propTypes = {
  selectedDataSourceData: PropTypes.shape({
    database_name: PropTypes.string.isRequired,
  }).isRequired, // Object with a database_name string field
  selectedProduct: PropTypes.string,
  setOpen: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
