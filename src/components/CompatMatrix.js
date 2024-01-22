import { AccordionItem, Dropdown} from '@carbon/ibm-security';
import { useEffect, useState } from 'react';
import ExpandingTableRow from './ExpandingTableRow';
import React from 'react';
import '../styles/styles.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Slider from '@mui/material/Slider';


// Compatibility Matrix/Table component
export default function CompatMatrix({rowData}) {

    const [GVSliderValue, setGVSliderValue] = React.useState([11.0, 11.4]);
    const [currentRowData, setCurrentRowData] = useState(rowData);
    const [currentSortedDB, setCurrentSortedDB] = useState(-1)
    const [currentSortedGuardium, setCurrentSortedGuardium] = useState(-1)
    const [currentSortedOS, setCurrentSortedOS] = useState(-1)
    const [selectedOS, setSelectedOS] = useState('All');
    
  
  
    // Get list of all OS names from full initial data
    const getOSNames = (rowDataCurr) => {
      var OSNames = ['All']
  
      for (let row in rowData) {
        for (let os in rowData[row].OS_VERSIONS) {
          let OSName = rowData[row].OS_VERSIONS[os].split(":")[0]
          if (OSNames.includes(OSName)){
          } else {
            OSNames.push(OSName)
          }
        }
      }
      return OSNames
    }
  
    /// Handles filtering based on Guardium Version and OS Version
    const handleFilters = (event,newGVValue,newOSValue) => {
      
      const lowerBound = newGVValue[0]
      const upperBound = newGVValue[1]
      setGVSliderValue(newGVValue);
  
      if (typeof(newOSValue) !== 'number') {
        // There was no change made on the Guardium Version Slider/Filter. Only filter based on OS
        setSelectedOS(newOSValue);
      }
    
      // Build new data for the table from original data
      const rowDataNew = rowData.filter(function(n,i){
        
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
          setCurrentRowData(rowDataNew)
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
  
          setCurrentRowData(rowDataNewFinal)
        }
      
    }
  
    
  
    
  
    useEffect(() => {
    },[JSON.stringify(currentRowData),currentRowData[0]]);
    
    
    const sortByOSVersion = () => {
      let newData = []
      
      newData = [...currentRowData].sort(compareByOSVersions)
      setCurrentRowData([...newData])
  
      if (currentSortedOS == -1) {
        setCurrentSortedOS(1)
      } else {
        setCurrentSortedOS(-1)
      }
      
    }
  
    const sortByGuardiumVersion = () => {
      let newData = []
      
      newData = [...currentRowData].sort(compareByGuardiumVersion)
      setCurrentRowData([...newData])
  
      if (currentSortedGuardium == -1) {
        setCurrentSortedGuardium(1)
      } else {
        setCurrentSortedGuardium(-1)
      }
      
    }
    
    
    const sortByDBVersion = () => {
      let newData = []
  
      if (currentSortedDB == -1) {
        newData = [...currentRowData].sort((a, b) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
        setCurrentRowData([...newData])
        setCurrentSortedDB(1)
      } else {
        newData = [...currentRowData].sort((b, a) => Number(a.DB_VERSIONS.toString().split("-")[0]) - Number(b.DB_VERSIONS.toString().split("-")[0]))
        setCurrentRowData([...newData])
        setCurrentSortedDB(-1)
      }
      
    }
  
  
    function compareByOSVersions(a, b) {
      if (currentSortedOS == -1) {
      return a.OS_VERSIONS.toString().localeCompare(b.OS_VERSIONS.toString());
    } else {
      return b.OS_VERSIONS.toString().localeCompare(a.OS_VERSIONS.toString());
    }
  }
  
  function compareByGuardiumVersion(a, b) {
    
    if (currentSortedGuardium == -1) {
      return a.GUARDIUM_VERSION.toString().localeCompare(b.GUARDIUM_VERSION.toString());
    } else {
      return b.GUARDIUM_VERSION.toString().localeCompare(a.GUARDIUM_VERSION.toString());
    }
  }  
    return (
  
      <AccordionItem
       open={true}
        key={"Detailed Support Information"}
        title={"Detailed Support Information"} size="lg"
        style={{display:"inline-block"}} >
  
          <br></br>
          
          <div style={{display:"flex"}}>
          Guardium Version: 
          <br></br>
          <Slider
                label="Guardium Version Change"
                size='small'
                value={GVSliderValue}
                max={11.4}
                min={11.0}
                step={0.1}
                onChange={handleFilters}
                valueLabelDisplay='on'
                title="Guardium Version Change"
                ticks
              
                
  
            />
            </div>
  
            <br></br>
            
            
            <div style={{display:"flex",justifyContent:"space-between"}}>
              Operating
              <br></br>
               System: 
                  <Dropdown
                  style={{minWidth:"150px",justifyContent:"center"}}
                    ariaLabel="OS Dropdown"
                    id="os-dropdown"
                    selectedItem={selectedOS}
                    items={getOSNames(currentRowData)}
                    label="Select an OS"
                    
                    onChange={
                      (item) => {
                        setSelectedOS(item.selectedItem)
                        handleFilters(null,GVSliderValue,item.selectedItem)
                      }
                    }
                  />
  
              </div>
  
              <br></br>
                
                          
                            <table >
                              <thead class='matrixheader'>
                                <tr>
                                <th className="uk-table-shrink"></th >
                                  
                                  <th class="dataheadercell" onClick={sortByDBVersion}>
                                          Database<br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedDB!=1)} />
                                      
                                    </th>
                                    <th class="dataheadercell" onClick={sortByGuardiumVersion}>
                                      Guardium <br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedGuardium!=1)} />
                                    </th>
                                    <th class="dataheadercell" onClick={sortByOSVersion} style={{whiteSpace:"pre-wrap"}}>
                                      OS<br/>Version<br/><ArrowDropDownIcon id={"rotate"+(currentSortedOS!=1)} />
                                    </th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentRowData.map((row) => (
                                  
                                  <ExpandingTableRow user={row} opened={false}/>
                                  
                        
                                ))}
                              </tbody>
                            </table>
                          
                        
                </AccordionItem>
  
                                
    )
  
  }