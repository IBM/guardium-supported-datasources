import React from "react";
import { Search } from "@carbon/ibm-security";
// import "./../styles/styles.css";

export default function MainPageSearchBar({
  searchValue,
  setSearchValue,
  handleSearchAndFilter,
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
      handleSearchAndFilter(
        (event.target && event.target.value) || "",
        undefined
      );
    },
  };

  return <Search className={`mainPageSearchBar`} {...searchColumnProps} />;
}
