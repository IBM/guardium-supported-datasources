import React from "react";
import { Dropdown } from "@carbon/ibm-security";

export default function MainPageDropdown({
  handleSearchAndFilter,
  selectedProduct,
  setSelectedProduct,
  PRODUCTS,
}) {
  return (
    <div className={`mainPageDropdown`}>
      <div className={`mainPageDropdownBox`}>
        <Dropdown
          ariaLabel="Products Dropdown"
          id="products-dropdown"
          selectedItem={selectedProduct}
          items={PRODUCTS}
          itemToString={(env) => env}
          label="Select a product"
          onChange={(item) => {
            setSelectedProduct(item.selectedItem);
            handleSearchAndFilter(undefined, item.selectedItem);
          }}
        />
      </div>
    </div>
  );
}
