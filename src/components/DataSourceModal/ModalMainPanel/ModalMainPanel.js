import { ModalTable } from "./ModalTable/ModalTable";
import React, { useState } from "react";

import OSDropDown from "./OSDropdown";
import { generateOnesList } from "../../../helpers/helpers";
import {
  DEFAULT_OS_DROPDOWN_VALUE,
  TableTypePropType,
  DEFAULT_GDP_VERSIONS,
} from "../../../helpers/consts";
import PropTypes from "prop-types";
import VersionCheckbox from "./VersionCheckbox";

// Compatibility Matrix/Table component
export default function ModalMainPanel({ jsonDataForDB, tableType, special_notes }) {
  // Used to handle logic related to sorting columns of table
  const [sortKey, setSortKey] = useState(
    generateOnesList(tableType.headers.length)
  );
  const [sortPriority, setSortPriority] = useState(0);

  // filter by version selection
  const [GDPVersions, setGDPVersions] = React.useState(DEFAULT_GDP_VERSIONS);

  // For handling logic of the OS dropdown
  const [selectedOS, setSelectedOS] = useState(DEFAULT_OS_DROPDOWN_VALUE);



  const NotesLine = special_notes.length ? (<><div className="notes-line"><strong>Notes:</strong>  {special_notes.join(", ")} </div></>) : null ;

  function filterSelectedGDPVersion(value, checked) {
    setGDPVersions((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );

    return;
  }


  // Change sorting of data when clicking on a header
  function changeSortKeyOnClick(ind) {
    setSortKey((prevSortKey) => {
      const updatedSortKey = [...prevSortKey];
      updatedSortKey[ind] =
        updatedSortKey[ind] === 1 ? -1 : updatedSortKey[ind] === -1 ? 0 : 1;
      return updatedSortKey;
    });
    setSortPriority(ind);
  }

  return (
    <div style={{ width: "max-content" }}>
      <br />

      <h5>Detailed Support Information</h5>
      <br />
      <br />

      {/* Slider + Filter (Only for Table Type 1) */}
      {tableType.id == 1 ? (
        <div className="tableType1Components">
          <br />
          <VersionCheckbox
            GDPVersions={GDPVersions}
            filterSelectedGDPVersion={filterSelectedGDPVersion}
            setGDPVersions={setGDPVersions}
          />

          <OSDropDown
            selectedOS={selectedOS}
            getUniqueOSNames={() => {
              return [
                "All",
                ...new Set(jsonDataForDB.flatMap((row) => row.OSName)),
              ];
            }}
            setSelectedOS={setSelectedOS}
          />
        </div>
      ) : null}
      <br />

      {NotesLine? NotesLine: null}
      {/* Wrapper for the main compat table */}
      
      <ModalTable
        jsonDataForDB={jsonDataForDB}
        changeSortKeyOnClick={changeSortKeyOnClick}
        tableType={tableType}
        sortKey={sortKey}
        // GVSliderValue={GVSliderValue}
        GDPVersions={GDPVersions}
        selectedOS={selectedOS}
        sortPriority={sortPriority}
      />
    </div>
  );
}

// Define the two possible types for jsonDataForDB
const JsonDataType1 = PropTypes.shape({
  GuardiumVersion: PropTypes.arrayOf(PropTypes.string), // Optional field
  OSName: PropTypes.arrayOf(PropTypes.string), // Optional field
  OSVersion: PropTypes.arrayOf(PropTypes.string),
  DatabaseName: PropTypes.arrayOf(PropTypes.string),
  DatabaseVersion: PropTypes.arrayOf(PropTypes.string), // Optional field
  "Network traffic": PropTypes.string.isRequired,
  "Local traffic": PropTypes.string.isRequired,
  "Encrypted traffic": PropTypes.string.isRequired,
  "Shared Memory": PropTypes.string.isRequired,
  Kerberos: PropTypes.string.isRequired,
  Blocking: PropTypes.string.isRequired,
  Redaction: PropTypes.string.isRequired,
  "UID Chain": PropTypes.string.isRequired,
  Compression: PropTypes.string.isRequired,
  "Query Rewrite": PropTypes.string.isRequired,
  "Instance Discovery": PropTypes.string.isRequired,
  Protocol: PropTypes.string.isRequired,
  Notes: PropTypes.string.isRequired,

  // Add other fields specific to this type
});

const JsonDataType2 = PropTypes.shape({
  GDP_Type: PropTypes.arrayOf(PropTypes.string).isRequired,
  Guardium_Version: PropTypes.arrayOf(PropTypes.string).isRequired,
  DataSource: PropTypes.arrayOf(PropTypes.string).isRequired,
  Database_Version: PropTypes.arrayOf(PropTypes.string).isRequired,
  VA_supported: PropTypes.string.isRequired,
  Classification_supported: PropTypes.string.isRequired,
  Notes: PropTypes.string.isRequired,
  Download_URL: PropTypes.string.isRequired,
  Readme_URL: PropTypes.string.isRequired,
});

// PropTypes validation
ModalMainPanel.propTypes = {
  jsonDataForDB: PropTypes.oneOfType([
    PropTypes.arrayOf(JsonDataType1),
    PropTypes.arrayOf(JsonDataType2),
  ]).isRequired, // Array of objects representing the database data
  tableType: TableTypePropType.isRequired,
  special_notes: PropTypes.arrayOf(PropTypes.string).isRequired,
};
