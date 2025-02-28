import React from "react";
import { Dropdown } from "@carbon/ibm-security";
import DropDownLabel from "./MainPageDropDownLabel";
// import PropTypes from "prop-types";

export default function MainPageOSDropdown({
  OSlist=[],
  selectedOS="",
  setSelectedOS=()=>{},
}) {
  return (
      <div className="mainPageDropdownBox">
      <DropDownLabel label="By OS" />
        <Dropdown className="main-page-drop-down"
          ariaLabel="OS Dropdown"
          id="os-dropdown"
          itemToString={(os) => os}
          items={Array.isArray(OSlist) ? OSlist : []}
          label="Select an OS"
          initialSelectedItem={selectedOS}
          onChange={(item) => {
            setSelectedOS(item.selectedItem);
          }}
        />
      </div>
  );
}

// MainPageDropdown.propTypes = {
//   handleSearchAndFilter: PropTypes.func.isRequired,
//   selectedProduct: PropTypes.string.isRequired,
//   setSelectedProduct: PropTypes.func.isRequired,
//   PRODUCTS: PropTypes.arrayOf(PropTypes.string).isRequired,
// };
