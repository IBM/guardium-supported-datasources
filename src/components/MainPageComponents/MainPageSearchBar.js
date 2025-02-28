import React from "react";
import { Search } from "@carbon/ibm-security";
import PropTypes from "prop-types";

export default function MainPageSearchBar({
  searchValue,
  setSearchValue,
}) {
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
      
    },
  };

  return <Search className="mainPageSearchBar" {...searchColumnProps} />;
}

MainPageSearchBar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  // handleSearchAndFilter: PropTypes.func.isRequired,
};
