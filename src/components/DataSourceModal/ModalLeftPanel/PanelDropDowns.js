import React from "react";
import { Dropdown } from "@carbon/ibm-security";
import PropTypes from "prop-types";

export function EnvironmentDropDown({
  selectedEnvironmentData,
  selectedDataSourceData,
  setSelectedEnvironmentData,
}) {
  return (
    <Dropdown
      ariaLabel="Environment Dropdown"
      id="environment-dropdown"
      selectedItem={selectedEnvironmentData}
      items={selectedDataSourceData.environments_supported}
      itemToString={(env) => env.environment_name}
      label="Choose Environment"
      titleText="Environment"
      onChange={(item) => {
        setSelectedEnvironmentData(item.selectedItem);
      }}
    />
  );
}

EnvironmentDropDown.propTypes = {
  selectedEnvironmentData: PropTypes.shape({
    environment_name: PropTypes.string.isRequired,
    methods_supported: PropTypes.arrayOf(
      PropTypes.shape({
        method_name: PropTypes.string.isRequired,
        method_key: PropTypes.string.isRequired,
      })
    ).isRequired,
  }), // Object representing the selected environment data
  selectedDataSourceData: PropTypes.shape({
    environments_supported: PropTypes.arrayOf(
      PropTypes.shape({
        environment_name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired, // Object with environments_supported array
  setSelectedEnvironmentData: PropTypes.func.isRequired, // Function to update selected environment data
};

export function MethodDropDown({
  selectedMethodData,
  selectedEnvironmentData,
  selectedProduct,
  setSelectedMethodData
}) {
  return (
    <Dropdown
              ariaLabel="Methods Dropdown"
              id="methods-dropdown"
              selectedItem={selectedMethodData}
              items={
                // If SaaS or Insights, remove STAP related methods
                selectedProduct === "Guardium Insights SaaS" ||
                selectedProduct === "Guardium Insights (Software)"
                  ? selectedEnvironmentData.methods_supported.filter(function (e) {
                      return (
                        e.method_key !== "External STAP" &&
                        e.method_key !== "STAP"
                      );
                    })
                  : selectedEnvironmentData.methods_supported
              }
              itemToString={(method) => method.method_name}
              label="Choose Method"
              titleText="Method"
              onChange={(item) => {
                setSelectedMethodData(item.selectedItem);
              }}
            />
  );
}

MethodDropDown.propTypes = {
  selectedMethodData: PropTypes.shape({
    method_name: PropTypes.string.isRequired,
  }), // Object representing the selected method data
  selectedEnvironmentData: PropTypes.shape({
    environment_name: PropTypes.string.isRequired,
    methods_supported: PropTypes.arrayOf(
      PropTypes.shape({
        method_name: PropTypes.string.isRequired,
        method_key: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired, // Object with methods_supported array
  selectedProduct: PropTypes.string.isRequired, // String representing the selected product
  setSelectedMethodData: PropTypes.func.isRequired, // Function to update selected method data
};
