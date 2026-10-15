import { Search } from "@carbon/react";
import PropTypes from "prop-types";

export default function MainPageSearchBar({ searchValue, setSearchValue }) {
  const searchColumnProps = {
    id: "search-columns",
    size: "lg",
    light: false,
    name: "search-columns",
    labelText: "Find a datasource",
    placeholder: "Find a datasource",
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
