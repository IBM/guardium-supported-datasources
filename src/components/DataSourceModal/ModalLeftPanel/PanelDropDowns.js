import React from "react";
import { Dropdown } from "@carbon/ibm-security";

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
  )
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
  )
};