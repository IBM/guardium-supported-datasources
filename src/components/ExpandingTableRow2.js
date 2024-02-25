import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function ExpandingTableRow2({data,opened}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.log("This is the Table2Data:" + JSON.stringify(data))
    // Equivalent to componentDidMount and componentDidUpdate
  }, [data]); // Empty array means this runs once on mount

  const toggleExpander = () => {
    setExpanded(!expanded)
  }

  const getRangeStringFromList = (versionList) => {
    if (versionList == null) {
        return ''; 
      }

    if (versionList.length === 1) {
        return versionList[0];
      } else if (versionList.length > 1) {
        return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
      }
      return '';
  }

  

  return [
  
    <tr key="main" onClick={toggleExpander} class="tablerow">
        <td class="datacell"><KeyboardArrowDownIcon id={"rotate"+expanded}/></td>
        
        <td class="datacell">{getRangeStringFromList(data["DatabaseVersion"])}</td>
        <td class="datacell">{getRangeStringFromList(data.GuardiumVersion)}</td>
        <td class="datacell">{getRangeStringFromList(data.OSVersion)}</td>
  
    </tr>,

  ];
}