import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { width } from '@mui/system';

function splitIntoPairs(list) {
  // Ensure the list has an even length by checking if it's odd and appending an empty string if necessary
  const adjustedList = list.length % 2 !== 0 ? [...list, {featureKey:"",featureName:""}] : list;

  // Use Array.from() to generate the pairs
  return Array.from({ length: adjustedList.length / 2 }, (_, i) => [adjustedList[i * 2], adjustedList[i * 2 + 1]]);
}

export default function ExpandingTableRow({key,data,opened,tableType}) {
  const [expanded, setExpanded] = useState(false);
  const [currentData, setCurrentData] = useState(data);

  function ExpandingTableCell(featureName,featureKey,featureValue){
    switch (featureKey){
      case "Download_URL":
        return (
          <>
          <td id="heading" class="top" >
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{ <a style={{"color":'blue',"textDecoration":'underline'}} target="_blank" href={featureValue}>Link</a>}</td>
          </>
        )
      case "Readme_URL":
        return (
          <>
          <td id="heading" class="top" >
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{<a style={{"color":'blue',"textDecoration":'underline'}}  target="_blank" href={featureValue}>Link</a>}</td>
          </>
        )
      default:
        return (
          <>
          <td id="heading" class="top">
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{featureValue}</td>
          </>
        )


    }
    
  }

  useEffect(() => {
    
    setCurrentData(data)
    
  }, [data,currentData,key]);

  const toggleExpander = () => {
    setExpanded(!expanded)
  }


  return [
    <tr key="main" onClick={toggleExpander} class="tablerow">
      
      <td class="datacell">
        {tableType.features.filter(obj => (currentData[obj.featureKey] != "" && currentData[obj.featureKey] != undefined)) != [] ? <KeyboardArrowDownIcon id={"rotate" + expanded} /> : <></> }
      </td>
       
      

      {tableType.headers.map(({ headerKey, getReadableString }) => (
        <td class="datacell"  >  {getReadableString(currentData[headerKey])}</td>
      ))}
    </tr>,

    expanded && (
      <tr class="expandable" key="tr-expander">
        <td className="uk-background-muted" colSpan={6}>
          <div className="inner uk-grid">
            
              <table id="specifics">
              {ExpandingTableCell("","","")}
                {splitIntoPairs(tableType.features.filter(obj => (currentData[obj.featureKey] != "" && currentData[obj.featureKey] != undefined))).map((a) => (
                  <tr>
                    {ExpandingTableCell(a[0].featureName,a[0].featureKey,currentData[a[0].featureKey])}
                    
                    {ExpandingTableCell(a[1].featureName,a[1].featureKey,currentData[a[1].featureKey])}
                  </tr>
                ))}
                {ExpandingTableCell("","","")}
              </table>
            
          </div>
        </td>
      </tr>
    ),
  ];
}