import React from "react";
import { Dropdown } from "@carbon/ibm-security";
import PropTypes from "prop-types";

export default function MainPageDropdown({
  handleSearchAndFilter,
  selectedProduct,
  setSelectedProduct,
  PRODUCTS,
}) {
  return (
    <div className="mainPageDropdown">
      <div className="mainPageDropdownBox">
        <Dropdown
          ariaLabel="Products Dropdown"
          id="products-dropdown"
          itemToString={(env) => env}
          items={PRODUCTS}
          label="Select a product"
          onChange={(item) => {
            setSelectedProduct(item.selectedItem);
            handleSearchAndFilter(undefined, item.selectedItem);
          }}
          selectedItem={selectedProduct}
        />
      </div>
    </div>
  );
}

MainPageDropdown.propTypes = {
  handleSearchAndFilter: PropTypes.func.isRequired,
  selectedProduct: PropTypes.string.isRequired,
  setSelectedProduct: PropTypes.func.isRequired,
  PRODUCTS: PropTypes.arrayOf(PropTypes.string).isRequired,
};
