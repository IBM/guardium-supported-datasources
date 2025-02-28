import React from "react";
import { Dropdown } from "@carbon/ibm-security";
import DropDownLabel from "./MainPageDropDownLabel"
import PropTypes from "prop-types";


export default function MainPageDropdown({
  // handleSearchAndFilter,
  selectedProduct,
  setSelectedProduct,
  PRODUCTS,
}) {
  return (
      <div className="mainPageDropdownBox">
        <DropDownLabel label="By Product" />
        
        <Dropdown
          ariaLabel="Filter by Products Dropdown"
          id="products-dropdown"
          itemToString={(env) => env}
          items={PRODUCTS}
          label="Select a product"
          onChange={(item) => {
            setSelectedProduct(item.selectedItem);
          }}
          selectedItem={selectedProduct}
        />
      </div>
  );
}

MainPageDropdown.propTypes = {
  selectedProduct: PropTypes.string.isRequired,
  setSelectedProduct: PropTypes.func.isRequired,
  PRODUCTS: PropTypes.arrayOf(PropTypes.string).isRequired,
};
