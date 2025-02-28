import React from "react";
import { Dropdown } from "@carbon/ibm-security";
import DropDownLabel from "./MainPageDropDownLabel";
// import PropTypes from "prop-types";

export default function MainPageMethodDropdown({
  methods,
  selectedMethod,
  setSelectedMethod,
}) {
  return (
    <div className="mainPageDropdown">
      <div className="mainPageDropdownBox">
      <DropDownLabel label="By Method" />
        <Dropdown
          ariaLabel="Methods Dropdown"
          id="methods-dropdown"
          itemToString={(env) => env}
          items={methods}
          label="Select a method"
          initialSelectedItem={selectedMethod}
          onChange={(item) => {
            setSelectedMethod(item.selectedItem);
          }}
        />
      </div>
    </div>
  );
}

// MainPageDropdown.propTypes = {
//   handleSearchAndFilter: PropTypes.func.isRequired,
//   selectedProduct: PropTypes.string.isRequired,
//   setSelectedProduct: PropTypes.func.isRequired,
//   PRODUCTS: PropTypes.arrayOf(PropTypes.string).isRequired,
// };
