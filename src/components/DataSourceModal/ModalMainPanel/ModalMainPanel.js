import React, { useState, useEffect } from "react";

import ModalTableHeaders from "./ModalTableHeaders";
import OSDropDown from "./OSDropdown";
import VersionSlider from "./VersionSlider";
import ExpandingTableRow from "./ExpandingTableRow";
import {
  isCompatibleWithRange,
  generateOnesList,
} from "../../../helpers/helpers";
import { GV_RANGE,DEFAULT_OS_DROPDOWN_VALUE } from "../../../helpers/consts";

// Compatibility Matrix/Table component
export default function ModalMainPanel({ jsonDataForDB, tableType }) {
  // Data used to populate the Compat Matrix/Main Table
  const [jsonData, setJSONData] = useState(jsonDataForDB);

  // Used to handle logic related to sorting columns of table
  const [sortKey, setSortKey] = useState(
    generateOnesList(tableType.headers.length)
  );
  const [sortPriority, setSortPriority] = useState(0);

  // For handling logic of the version slider
  const [GVSliderValue, setGVSliderValue] = React.useState(GV_RANGE);

  // For handling logic of the OS dropdown
  const [selectedOS, setSelectedOS] = useState(DEFAULT_OS_DROPDOWN_VALUE);

  useEffect(() => {
    setJSONData(jsonDataForDB);
  }, [jsonDataForDB]);

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

  // Applies applicable sortings + filters on full data for that DB (i.e displayData) and returns it
  function SortedAndFilteredDisplayData() {
    var sortedData = [...jsonData];

    // TODO: Instead of only filtering,manipulated to remove filtered values (specifically on for GV)
    // TODO: Fix sort, how can u sort between 2 ranges?

    // Filter on Guardium Version Range + selected OS (Only for TableType 1)
    if (tableType.id == 1) {
      const lowerBound = GVSliderValue[0];
      const upperBound = GVSliderValue[1];
      sortedData = sortedData.filter((row) =>
        isCompatibleWithRange(row.GuardiumVersion, lowerBound, upperBound)
      );

      if (selectedOS != "All") {
        sortedData = sortedData.filter((row) =>
          row.OSName.includes(selectedOS)
        );
      }
    }
    if (sortedData.length == 0) {
      return [];
    }

    // Apply sorting to data based on sort key (based on headers clicked)
    for (let i = 0; i < sortKey.length; i++) {
      if (sortKey[i] != 0) {
        if (sortKey[i] == 1) {
          sortedData = sortedData.sort(tableType.headers[i].sorta);
        }
        if (sortKey[i] == -1) {
          sortedData = sortedData.sort(tableType.headers[i].sortd);
        }
      }
    }
    // Ensure that the header that is clicked is sorted last
    if (sortKey[sortPriority] == 1) {
      sortedData = sortedData.sort(tableType.headers[sortPriority].sorta);
    }
    if (sortKey[sortPriority] == -1) {
      sortedData = sortedData.sort(tableType.headers[sortPriority].sortd);
    }

    return sortedData;
  }

  

  return (
    <div style={{ width: "max-content" }}>
      <br></br>

      <h5>Detailed Support Information</h5>
      <br></br>
      <br></br>

      {/* Slider + Filter (Only for Table Type 1) */}
      {tableType.id == 1 ? (
        <div>
          <VersionSlider
            GVSliderValue={GVSliderValue}
            setGVSliderValue={setGVSliderValue}
          />

          <br></br>

          <OSDropDown
            selectedOS={selectedOS}
            getUniqueOSNames={() => {return (["All", ...new Set(jsonData.flatMap(row => row.OSName))])}}
            setSelectedOS={setSelectedOS}
            setGVSliderValue={setGVSliderValue}
            GVSliderValue={GVSliderValue}
          />
        </div>
      ) : null}
      <br></br>

      {/* Wrapper for the main compat table */}
      <div className="mainTableWrapper">
        <table class="maintable">
          <ModalTableHeaders
            changeSortKeyOnClick={changeSortKeyOnClick}
            tableType={tableType}
            sortKey={sortKey}
          />

          {/* Each row of data (sorted and filtered) mapped to an Expanding Table Row within <table> */}
          <tbody>
            {SortedAndFilteredDisplayData().map((row, index) => (
              <ExpandingTableRow
                key={index}
                data={row}
                opened={false}
                tableType={tableType}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
