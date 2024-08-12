import React from 'react';
import {Search} from "@carbon/ibm-security";

export default function DataSourceSearchInput({ searchValue, setSearchValue, handleSearchChange, BLOCK_CLASS }) {
    const searchColumnProps = {
      id: "search-columns",
      size: "xl",
      light: false,
      name: "search-columns",
      defaultValue: "",
      labelText: "Find a DataSource",
      placeholder: "Find a DataSource",
      value: searchValue,
      onChange: (event) => {
        setSearchValue((event.target && event.target.value) || "");
        handleSearchChange(((event.target && event.target.value) || ""),undefined);

      }

        

    };
  
    return <Search className={`${BLOCK_CLASS}__search`} {...searchColumnProps} />;
  }