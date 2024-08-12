import React from 'react';
import { Dropdown } from "@carbon/ibm-security";

export default function DataSourcesFilterDropdown({ handleSearchChange,selectedProduct, setSelectedProduct,setConnectionData,connectionData, PRODUCTS,BLOCK_CLASS }) {
    return (
        <div className={`${BLOCK_CLASS}__header-box`}>
        <div className={`${BLOCK_CLASS}__category_title bx--type-semibold`}>
            DataSources supported by Guardium
        </div>
        <div className={`${BLOCK_CLASS}__version-dropdown-box`}>
            <Dropdown
            ariaLabel="Products Dropdown"
            id="products-dropdown"
            selectedItem={selectedProduct}
            items={PRODUCTS}
            itemToString={(env) => env}
            label="Select a product"
            onChange={(item) => {
                setSelectedProduct(item.selectedItem);
                handleSearchChange(undefined,item.selectedItem)
            }}
            />
        </div>
        </div>
    );
}