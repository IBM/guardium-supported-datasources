import { useEffect, useState } from "react";
import React from "react";
import { Loading, Modal } from "@carbon/ibm-security";

import { EnvironmentDropDown, MethodDropDown } from "./ModalLeftPanel/PanelDropDowns";
import ModalMainPanel from "./ModalMainPanel/ModalMainPanel";
import PanelCollapsibleInfo from "./ModalLeftPanel/PanelCollapsibleInfo";
import { getJSONData,BLOCK_CLASS } from "../../helpers/consts";


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
        return;
      }

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
      // Update the table type state
      setTableType(tableType);
    } catch (error) {
      // Handle any errors that occur during data fetching
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data." + error);
    } finally {
      // Set loading state to false after the operation is complete
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <Modal
      size={"lg"}
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

            {selectedDataSourceData && (
              <EnvironmentDropDown
                selectedEnvironmentData={selectedEnvironmentData}
                selectedDataSourceData={selectedDataSourceData}
                setSelectedEnvironmentData={setSelectedEnvironmentData}
              />
            )}

            {selectedEnvironmentData && (
              <MethodDropDown
                selectedMethodData={selectedMethodData}
                selectedEnvironmentData={selectedEnvironmentData}
                selectedProduct={selectedProduct}
                setSelectedMethodData={setSelectedMethodData}
              />
            )}

            {selectedMethodData && (
              <PanelCollapsibleInfo
                selectedMethodData={selectedMethodData}
                toolTipOpen={toolTipOpen}
                setToolTipOpen={setToolTipOpen}
              />
            )}
          
        </div>

        <div className={`${BLOCK_CLASS}__modal_main_panel_wrapper`}>
          {/* Compatibility Matrix */}
          {(selectedMethodData && tableType && jsonDataForDB) ? (
            <ModalMainPanel
              tableType={tableType}
              jsonDataForDB={jsonDataForDB}
            />
          ):
          (errorMessage!=="" && <p>Error: {errorMessage}</p>)
          }
        </div>
      </div>
    </Modal>
  );
}
