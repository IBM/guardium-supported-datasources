import React, { useState, useEffect } from 'react';
import ExpandingTableRow from './ExpandingTableRow';
import { AccordionItem, Dropdown} from '@carbon/ibm-security';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Slider from '@mui/material/Slider';
import { isCompatibleWithRange,generateOnesList } from '../helpers/helpers';



// Compatibility Matrix/Table component
export default function CompatMatrix({initialData,tableType}) {


  const [displayData, setDisplayData] = useState(initialData); // Current Display Data
  const [sortKey, setSortKey] = useState(generateOnesList(tableType.headers.length))
  const [sortPriority,setSortPriority] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxTableWidth, setMaxTableWidth] = useState(0)
  const [GVSliderValue, setGVSliderValue] = React.useState([11.0, 12.0]);
  const [selectedOS, setSelectedOS] = useState('All');

  useEffect(() => {
    setDisplayData(initialData)  // Reset display data (Why?)
  },[initialData,sortKey,GVSliderValue,selectedOS]);

  // Change sorting of data when clicking on a header
  function changeSortKeyOnClick(ind) {

    var sortKeyCopy = [...sortKey]
    if (sortKey[ind] == 0) {
      sortKeyCopy[ind] = 1
    } else if (sortKey[ind] == 1) {
      sortKeyCopy[ind] = -1
    } else if (sortKey[ind] == -1) {
      sortKeyCopy[ind] = 0
    }
    
    setSortKey(sortKeyCopy)
    setSortPriority(ind)

  }

  // Get lisf of "All" ++ [All Unique OS Names] for use in dropdown filter
  function getUniqueOSNames() {

    var lst = ["All"]

    for (const row of displayData) {
      for (const osName of row.OSName) {
        if (!lst.includes(osName)) {
          lst.push(osName)
        }
      }
    }

    return lst

  }

  // Applies applicable sortings + filters on full data for that DB (i.e displayData) and returns it
  function SortedAndFilteredDisplayData() {

    var sortedData = [...displayData];

    // Filter on Guardium Version Range + selected OS (Only for TableType 1)
    if (tableType.id == 1) {
      const lowerBound = GVSliderValue[0]
      const upperBound = GVSliderValue[1]
      sortedData = sortedData.filter(row => isCompatibleWithRange(row.GuardiumVersion,lowerBound,upperBound))

      if (selectedOS != "All") {
      sortedData = sortedData.filter(row => row.OSName.includes(selectedOS))
      }
    }
    if (sortedData.length == 0) {
      return []
    }

    // Apply sorting to data based on sort key (based on headers clicked)
    for (let i = 0; i < sortKey.length; i++) {
      if (sortKey[i] != 0) {

        if (sortKey[i] == 1){
          sortedData = sortedData.sort(tableType.headers[i].sorta)
        }
        if (sortKey[i] == -1){
          sortedData = sortedData.sort(tableType.headers[i].sortd)
        }

      }
    }
    // Ensure that the header that is clicked is sorted last
    if (sortKey[sortPriority] == 1){
    
      sortedData = sortedData.sort(tableType.headers[sortPriority].sorta)
    }
    if (sortKey[sortPriority] == -1){
      sortedData = sortedData.sort(tableType.headers[sortPriority].sortd)
    }

    return sortedData
  }
    

  function renderTable(){
      return (
        // Wrapper for (Slider + Filter) +  Table 
        <div style={{ width: "min-content" }} >

          <h5>Detailed Support Information</h5>
          <br></br>
          <br></br>

          {/* Slider + Filter (Only for Table Type 1) */}
          {tableType.id == 1 ? 
          SliderAndFilterForTableType1() : null}
          <br></br>

          {/* Wrapper for the main compat table */}
          <table class="maintable">
            {CompatMatrixHeaders()}

            {/* Each row of data (sorted and filtered) mapped to an Expanding Table Row within <table> */}
            <tbody>
              {SortedAndFilteredDisplayData().map((row, index) => (
                // <ExpandingTableRow user={row} opened={false}/>
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
      );



    function CompatMatrixHeaders() {
      return <thead class="matrixheader">
        <tr>
          <th className="uk-table-shrink"></th>
          {tableType.headers.map(({ id, headerName }) => (
            <th
              style={{ minWidth: maxWidth, whiteSpace: "nowrap" }}
              class="dataheadercell"
              onClick={() => changeSortKeyOnClick(id)}
            >
              {headerName}
              <br></br>

              {/* Orienation of arrow depends on current sort key for that column */}
              {<ArrowDropDownIcon 
                id={sortKey[id] != -0
                  ? "rotate" + (sortKey[id] != -1)
                  : "rotatemed"} />}

              <br />
  
            </th>
          ))}
        </tr>
      </thead>;
    }

    function SliderAndFilterForTableType1() {
      return <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p style={{ whiteSpace: "nowrap" }}>Guardium Version</p>

          <Slider
            style={{ width: "50%" }}
            label="Guardium Version Change"
            size="small"
            value={GVSliderValue}
            max={12.0}
            min={11.0}
            step={null} // Setting step to null to only allow values defined in marks
            onChange={(event, newGVValue) => { setGVSliderValue(newGVValue); } }
            valueLabelDisplay="on"
            title="Guardium Version Change"
            marks={[
              { value: 11.0 },
              { value: 11.1 },
              { value: 11.2 },
              { value: 11.3 },
              { value: 11.4 },
              { value: 11.5 },
              { value: 12.0 }
            ]} // Using marks to indicate allowed values
          />
        </div>

        <br></br>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Operating System </p>
          <Dropdown
            style={{
              minWidth: "150px",
              justifyContent: "center",
              justify: "contents",
            }}
            ariaLabel="OS Dropdown"
            id="os-dropdown"
            selectedItem={selectedOS}
            items={getUniqueOSNames()}
            label="Select an OS"
            onChange={(item) => {
              setSelectedOS(item.selectedItem);
              setGVSliderValue(GVSliderValue);
            } } />
        </div>
      </div>;
    }
    }

    return (
        <div>
          <br></br>
          {renderTable()}
        </div>
    );
}