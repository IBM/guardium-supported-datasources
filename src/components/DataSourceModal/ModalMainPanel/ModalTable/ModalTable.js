import React from "react";
import ModalTableHeaders from "./ModalTableHeaders";
import {
    FiltersForTableType1,
  } from "../../../../helpers/helpers";
  import ExpandingTableRow from "./ExpandingTableRow/ExpandingTableRow";

export function ModalTable({
    jsonDataForDB,
  changeSortKeyOnClick,
  tableType,
  sortKey,
  GVSliderValue,
  selectedOS,
  sortPriority
}) {
    // Applies applicable sortings + filters on full data for that DB (i.e displayData) and returns it
  function SortedAndFilteredDisplayData() {
    var sortedData = JSON.parse(JSON.stringify(jsonDataForDB));

    // Filter out any out-of-range Guardium Version values
    // And Filter for SelectedOS
    if (tableType.id == 1 && Array.isArray(sortedData)) {
      sortedData = FiltersForTableType1(GVSliderValue, sortedData, selectedOS);
    }
    if (sortedData.length == 0) {
      return [];
    }

    // Apply sorting to data based on sort key (based on headers clicked)
    sortKey.forEach((key, i) => {
      if (key !== 0) {
        const sortFunction =
          key === 1 ? tableType.headers[i].sorta : tableType.headers[i].sortd;
        sortedData = sortedData.sort(sortFunction);
      }
    });

    // Ensure that the header that is clicked is sorted last
    if (sortPriority !== 0) {
        const sortFunction =
          sortKey[sortPriority] === 1
            ? tableType.headers[sortPriority].sorta
            : tableType.headers[sortPriority].sortd
        
        sortedData = sortedData.sort(sortFunction);
    }

  
    return sortedData;
  }

  return <div className="mainTableWrapper">
        <table className="maintable">
          <ModalTableHeaders changeSortKeyOnClick={changeSortKeyOnClick} tableType={tableType} sortKey={sortKey} />

          {
        /* Each row of data (sorted and filtered) mapped to an Expanding Table Row within <table> */
      }
          <tbody>
            {SortedAndFilteredDisplayData().map((row, index) => <ExpandingTableRow key={index} data={row} tableType={tableType} />)}
          </tbody>
        </table>
      </div>;
}
  