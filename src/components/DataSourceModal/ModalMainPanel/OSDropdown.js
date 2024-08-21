import React from "react";
import { Dropdown } from "@carbon/ibm-security";

export default function OSDropDown({
  selectedOS,
  getUniqueOSNames,
  setSelectedOS,
}) {
  return (
    <div className="OSDropdownDiv">
      <p>Operating System </p>
      <Dropdown
        className="OSDropdown"
        ariaLabel="OS Dropdown"
        id="os-dropdown"
        selectedItem={selectedOS}
        items={getUniqueOSNames()}
        label="Select an OS"
        onChange={(item) => {
          setSelectedOS(item.selectedItem);
        }}
      />
    </div>
  );
}
