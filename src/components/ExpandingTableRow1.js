import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function ExpandingTableRow1({key,data,opened}) {
  const [expanded, setExpanded] = useState(false);
  const [currentData, setCurrentData] = useState(data);

  useEffect(() => {
    console.log("This is the Table1currentData:" + JSON.stringify(currentData))
    setCurrentData(data)
    // Equivalent to componentDidMount and componentDidUpdate
  }, [data,currentData,key]);

  const toggleExpander = () => {
    setExpanded(!expanded)
  }

  const getRangeStringFromList = (versionList) => {

    if (versionList == null || versionList == '') {
        return '-'; 
      }

    if (versionList.length === 1) {
        return versionList[0];
      } else if (versionList.length > 1) {
        return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
      }
      return '-';
  }

  

  return [
  
    <tr key="main" onClick={toggleExpander} class="tablerow">
        <td class="datacell"><KeyboardArrowDownIcon id={"rotate"+expanded}/></td>
        
        <td class="datacell">{getRangeStringFromList(currentData.GDP_Version)}</td>
        <td class="datacell">{getRangeStringFromList(currentData.GI_Version)}</td>
        <td class="datacell">{getRangeStringFromList(currentData.DataSource_Version)}</td>
  
    </tr>,

  ];
}