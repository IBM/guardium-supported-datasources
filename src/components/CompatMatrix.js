import React, { useState, useEffect } from 'react';
import ExpandingTableRow from './ExpandingTableRow';
import { AccordionItem, Dropdown} from '@carbon/ibm-security';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Slider from '@mui/material/Slider';
import {splitStringsCompare,splitStrings} from './DatasourceModal'



// Compatibility Matrix/Table component
export default function CompatMatrix({initialData,tableType}) {

  
  function generateOnesList(length) {
    return Array.from({ length }, () => 0);
  }

  function changeSortKeyOnClick(ind) {

    console.log("INDEX:" + ind)
    

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

  function isCompatibleWithRange(lst,rangea,rangeb) {
    
    for (const lstElem of lst) {
      if ((lstElem >= rangea) && (lstElem <= rangeb)) {
        return true

      }
    }
    return false

  }

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

  // function getUniqueDBVersion() {
  //   var lst = []

  //   var count = 0

  //   var uniq_dbs = []
  //   for (const row of initialData) {
  //     if (tableType.id == 1) {
  //       for (const dbVersion of row.DatabaseVersion) {
  //         if (!uniq_dbs.includes(dbVersion)) {
  //           uniq_dbs.push(dbVersion)
  //         }
  //       }
  //     }
  //     if (tableType.id == 2) {
  //       for (const dbVersion of row.DataSource_Version) {
  //         if (!uniq_dbs.includes(dbVersion)) {
  //           uniq_dbs.push(dbVersion)
  //         }
  //       }
  //     }
  //   }

  //   if (tableType.id == 1) {
  //     uniq_dbs = uniq_dbs.sort((a,b) => {
  //       return splitStringsCompare(splitStrings(a),splitStrings(b))
  //     })
  //   }

  //   if (tableType.id == 2) {
  //     uniq_dbs = uniq_dbs.sort((a,b) => {
  //       return splitStringsCompare(splitStrings(a.DataSource_Version),splitStrings(b.DataSource_Version))
  //     })
  //   }
  //   var count = 0
  //   for (const uniq_db of uniq_dbs) {
  //     count += 1
  //     lst.push({
  //                 value: count,
  //                 label: uniq_db
  //               })

  //   }
    

  //   return lst


  // }

  function SortedDisplayData() {

    var sortedData = [...displayData];

    

    if (tableType.id == 1) {
      const lowerBound = GVSliderValue[0]
      const upperBound = GVSliderValue[1]
      sortedData = sortedData.filter(row => isCompatibleWithRange(row.GuardiumVersion,lowerBound,upperBound))

      if (selectedOS != "All") {
      sortedData = sortedData.filter(row => row.OSName.includes(selectedOS))
      
      }
      
    }
    console.log("This sis the sorted data:" + sortedData.length)
    if (sortedData.length == 0) {
      console.log("We in here?")
      return []
    }

    console.log("SORT_KEY2:"+ sortKey)
    
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

    const [displayData, setDisplayData] = useState(initialData); // Current Display Data
    const [sortKey, setSortKey] = useState(generateOnesList(tableType.headers.length))
    const [sortPriority,setSortPriority] = useState(0);
    const [maxHeight, setMaxHeight] = useState(0);
    const [maxWidth, setMaxWidth] = useState(0);
    const [maxTableWidth, setMaxTableWidth] = useState(0)
    const [GVSliderValue, setGVSliderValue] = React.useState([11.0, 11.4]);
    // const [DBSliderValue, setDBSliderValue] = React.useState(0,getUniqueDBVersion().length);
    
    const [selectedOS, setSelectedOS] = useState('All');




    
    useEffect(() => {
        setDisplayData(initialData)
    

        
    },[initialData,sortKey,GVSliderValue,selectedOS]);

    const handleFilters = (event,newGVValue,newOSValue) => {


      const lowerBound = newGVValue[0]
      const upperBound = newGVValue[1]
      console.log("upperBound" + newGVValue)
      console.log("lowerBound" + lowerBound)
      setGVSliderValue(newGVValue);

    }


    function renderTable(){
        return (
          <div style={{ width: "min-content" }}>
            <h5>Detailed Support Information</h5>
            <br></br>
            <br></br>

            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ whiteSpace: "nowrap" }}>Database Version</p>
              <Slider
    
                label="Database Version Change"
                size="small"
                value={DBSliderValue}
                marks={getUniqueDBVersion()}
                step={1}
                max={getUniqueDBVersion().length}
                min={0}
                onChange={() => {console.log("hello")}}
                valueLabelDisplay="on"
                title="Guardium Version Change"
                ticks
              />
            </div> */}

            {tableType.id == 1 ? (
              <div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <p style={{ whiteSpace: "nowrap" }}>Guardium Version</p>
                  <Slider
                    style={{ width: "50%" }}
                    label="Guardium Version Change"
                    size="small"
                    value={GVSliderValue}
                    max={11.4}
                    min={11.0}
                    step={0.1}
                    onChange={handleFilters}
                    valueLabelDisplay="on"
                    title="Guardium Version Change"
                    ticks
                  />
                </div>
                <br></br>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
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
                      handleFilters(null, GVSliderValue, item.selectedItem);
                    }}
                  />
                </div>
              </div>
            ) : null}
            <br></br>

            <table class="maintable">
              <thead class="matrixheader">
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

                      {
                        <ArrowDropDownIcon
                          id={
                            sortKey[id] != -0
                              ? "rotate" + (sortKey[id] != -1)
                              : "rotatemed"
                          }
                        />
                      }

                      <br />
                      {/* <ArrowDropDownIcon id={"rotate" + (currentSortedOS != 1)} /> */}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SortedDisplayData().map((row, index) => (
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


    }

    return (
        <div
        
        >
          <br></br>
          {renderTable()}

        </div>

    );




}