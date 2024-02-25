import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

function splitIntoPairs(list) {
  // Ensure the list has an even length by checking if it's odd and appending an empty string if necessary
  const adjustedList = list.length % 2 !== 0 ? [...list, {featureKey:"",featureName:""}] : list;

  // Use Array.from() to generate the pairs
  return Array.from({ length: adjustedList.length / 2 }, (_, i) => [adjustedList[i * 2], adjustedList[i * 2 + 1]]);
}

export default function ExpandingTableRow({key,data,opened,tableType}) {
  const [expanded, setExpanded] = useState(false);
  const [currentData, setCurrentData] = useState(data);

  useEffect(() => {
    
    console.log("This is the TablecurrentData:" + JSON.stringify(tableType))
    setCurrentData(data)
    // Equivalent to componentDidMount and componentDidUpdate
  }, [data,currentData,key]);

  const toggleExpander = () => {
    setExpanded(!expanded)
  }


  return [
    <tr key="main" onClick={toggleExpander} class="tablerow">
      <td class="datacell">
        <KeyboardArrowDownIcon id={"rotate" + expanded} />
      </td>

      {tableType.headers.map(({ headerKey, getReadableString }) => (
        <td class="datacell">{getReadableString(currentData[headerKey])}</td>
      ))}
    </tr>,

    expanded && (
      <tr class="expandable" key="tr-expander">
        <td className="uk-background-muted" colSpan={6}>
          <div className="inner uk-grid">
            
              <table id="specifics">
                {splitIntoPairs(tableType.features).map((a) => (
                  <tr>
                    <td id="heading" class="top">
                      {" "}
                      {a[0].featureName}
                    </td>
                    <td class="top" >{currentData[a[0].featureKey]}</td>
                    
                    <td id="heading" class="top">
                      {" "}
                      {a[1].featureName}
                    </td>
                    <td class="top">{currentData[a[1].featureKey]}</td>
                  </tr>
                ))}
              </table>
            
          </div>
        </td>
      </tr>
    ),
  ];
}