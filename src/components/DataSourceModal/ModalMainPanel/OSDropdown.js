import React from "react";
import { Dropdown } from "@carbon/ibm-security";

export default function OSDropDown({
  selectedOS,
  getUniqueOSNames,
  setSelectedOS,
  setGVSliderValue,
  GVSliderValue,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <p>Operating System </p>
      <Dropdown
        style={{
          minWidth: "150px",
          justifyContent: "center",
          justify: "contents",
        }}
        ariaLabel="OS Dropdown"
        id="os-dropdown"
        selectedItem={selectedOS}
        items={getUniqueOSNames()}
        label="Select an OS"
        onChange={(item) => {
          setSelectedOS(item.selectedItem);
          setGVSliderValue(GVSliderValue);
        }}
      />
    </div>
  );
}
