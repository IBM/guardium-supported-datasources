import { AccordionItem, Dropdown} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import ExpandingTableRow1 from './ExpandingTableRow1'
import React from 'react';
import '../styles/styles.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Slider from '@mui/material/Slider';


// Compatibility Matrix/Table component
export default function CompatMatrix1({initialData,tableType}) {
  
  const [currentDataForDB, setCurrentDataForDB] = useState(initialData);
  const [GVSliderValue, setGVSliderValue] = React.useState([11.0, 11.4]); // Fix
  const [selectedOS, setSelectedOS] = useState('All');
  
  const [currentSortedDB, setCurrentSortedDB] = useState(-1)
  const [currentSortedGuardium, setCurrentSortedGuardium] = useState(-1)
  const [currentSortedOS, setCurrentSortedOS] = useState(-1)
  
  


  // Get list of all OS names from full initial data
  const getOSNames = (rowDataCurr) => { //TODO: Change this
    var OSNames = ['All']

    for (let row in initialData) {
      for (let os in initialData[row].OS_VERSIONS) {
        let OSName = initialData[row].OS_VERSIONS[os].split(":")[0]
        if (OSNames.includes(OSName)){
        } else {
          OSNames.push(OSName)
        }
      }
    }
    return OSNames
  }

  /// Handles filtering based on Guardium Version and OS Version
  const handleFilters = (event,newGVValue,newOSValue) => { //TODO: Change this
    
    const lowerBound = newGVValue[0]
    const upperBound = newGVValue[1]
    setGVSliderValue(newGVValue);

    if (typeof(newOSValue) !== 'number') {
      // There was no change made on the Guardium Version Slider/Filter. Only filter based on OS
      setSelectedOS(newOSValue);
    }
  
    // Build new data for the table from original data
    const rowDataNew = initialData.filter(function(n,i){
      
      var gv = typeof(n.GUARDIUM_VERSION) != undefined ? n.GUARDIUM_VERSION : ""
      
      // There is a range describing the Guardium Version, eg. "11.1-11.2","11-11.4"
      if ((gv.split("-").length) > 1) {
        const currentLower = gv.split("-")[0]
        const currentUpper = gv.split("-")[1]
        return (Number(currentLower) >= Number(lowerBound) && Number(currentLower) <= Number(upperBound)) || (Number(currentUpper) <= Number(upperBound) && Number(currentUpper) >= Number(lowerBound)) 
      }
      
      // There is a single number describing the Guardium Version
      return Number(gv) >= Number(lowerBound) && Number(gv) <= Number(upperBound)

    })

  
      // Filter based on OS
      if (newOSValue == "All"){
        setCurrentDataForDB(rowDataNew)
      } else if (typeof(newOSValue) === 'number') {
        // OS Dropdown was not changed
        // There was no change made on the OS Version Slider/Filter. Only filter based on new Guardium Version Filter and current OS dropdown value
        handleFilters(null,newGVValue,selectedOS)
      } else {
        // Filter based on OS
        const rowDataNewFinal = rowDataNew.filter(function(n,i){
          var rowOS = typeof(n.OS_VERSIONS) != undefined ? n.OS_VERSIONS.toString() : ""
          return rowOS.includes(newOSValue)
        })

        setCurrentDataForDB(rowDataNewFinal)
      }
    
  }

  


  useEffect(() => {
    setCurrentDataForDB(initialData)
  },[initialData]);
  
  
//   const sortByOSVersion = () => {
//     let newData = []
    
//     newData = [...currentDataForDB].sort(compareByOSVersions)
//     setCurrentDataForDB([...newData])

//     if (currentSortedOS == -1) {
//       setCurrentSortedOS(1)
//     } else {
//       setCurrentSortedOS(-1)
//     }
    
//   }

//   const sortByGuardiumVersion = () => {
//     let newData = []
    
//     newData = [...currentDataForDB].sort(compareByGuardiumVersion)
//     setCurrentDataForDB([...newData])

//     if (currentSortedGuardium == -1) {
//       setCurrentSortedGuardium(1)
//     } else {
//       setCurrentSortedGuardium(-1)
//     }
    
//   }

//   const sortByDBVersion = () => {
//     let newData = []

//     if (currentSortedDB == -1) {
//       newData = [...currentDataForDB].sort((a, b) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
//       setCurrentDataForDB([...newData])
//       setCurrentSortedDB(1)
//     } else {
//       newData = [...currentDataForDB].sort((b, a) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
//       setCurrentDataForDB([...newData])
//       setCurrentSortedDB(-1)
//     }
    
//   }

//   function compareByOSVersions(a, b) {
//     if (currentSortedOS == -1) {
//     return a.OS_VERSIONS.toString().localeCompare(b.OS_VERSIONS.toString());
//   } else {
//     return b.OS_VERSIONS.toString().localeCompare(a.OS_VERSIONS.toString());
//   }
//   }

// function compareByGuardiumVersion(a, b) {
  
//   if (currentSortedGuardium == -1) {
//     return a.GUARDIUM_VERSION.toString().localeCompare(b.GUARDIUM_VERSION.toString());
//   } else {
//     return b.GUARDIUM_VERSION.toString().localeCompare(a.GUARDIUM_VERSION.toString());
//   }
//   }  

function renderTable1() {
  console.log("This is the currentDataForDB:" + JSON.stringify(currentDataForDB))
    
    return (
      <table style={{ minWidth: "1000px;" }}>
        <thead class="matrixheader">
          <tr>
            <th className="uk-table-shrink"></th>

            <th class="dataheadercell" 
            // onClick={sortByOSVersion}
            >
              GDP Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedOS != 1)} /> */}
            </th>
            <th class="dataheadercell" 
            // onClick={sortByGuardiumVersion}
            >
              GI <br />
              Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedGuardium != 1)} /> */}
            </th>
            <th
              class="dataheadercell"
              // onClick={sortByDBVersion}
              style={{ whiteSpace: "pre-wrap" }}
            >
              Database
              <br />
              Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedDB != 1)} /> */}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentDataForDB.map((row,index) => (
            // <ExpandingTableRow user={row} opened={false}/>
            <ExpandingTableRow1 key={index} data={row} opened={false} />
          ))}
        </tbody>
      </table>
    );


}
  return (
    <AccordionItem
      open={true}
      key={"Detailed Support Information"}
      title={"Detailed Support Information"}
      size="lg"
      style={{ display: "inline-block" }}
    >
      <br></br>

      {/* SLIDER  */}
      {/* <div style={{ display: "flex" }}>  
        Guardium Version:
        <br></br>
        <Slider
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
      </div> */}

      <br></br>

      {/* FILTER */}
      {/* <div style={{ display: "flex", justifyContent: "space-between" }}> 
        Operating
        <br></br>
        System:
        <Dropdown
          style={{ minWidth: "150px", justifyContent: "center" }}
          ariaLabel="OS Dropdown"
          id="os-dropdown"
          selectedItem={selectedOS}
          items={getOSNames(currentDataForDB)}
          label="Select an OS"
          onChange={(item) => {
            setSelectedOS(item.selectedItem);
            handleFilters(null, GVSliderValue, item.selectedItem);
          }}
        />
      </div> */}

      <br></br>

      <table style={{ minWidth: "1000px;" }}>
        <thead class="matrixheader">
          <tr>
            <th className="uk-table-shrink"></th>

            <th class="dataheadercell" 
            // onClick={sortByOSVersion}
            >
              GDP Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedOS != 1)} /> */}
            </th>
            <th class="dataheadercell" 
            // onClick={sortByGuardiumVersion}
            >
              GI <br />
              Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedGuardium != 1)} /> */}
            </th>
            <th
              class="dataheadercell"
              // onClick={sortByDBVersion}
              style={{ whiteSpace: "pre-wrap" }}
            >
              Database
              <br />
              Version
              <br />
              {/* <ArrowDropDownIcon id={"rotate" + (currentSortedDB != 1)} /> */}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentDataForDB.map((row,index) => (
            // <ExpandingTableRow user={row} opened={false}/>
            <ExpandingTableRow1 key={JSON.stringify} data={row} opened={false} />
          ))}
        </tbody>
      </table>
    </AccordionItem>
  );

}