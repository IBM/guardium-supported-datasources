import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { splitIntoPairs } from '../helpers/helpers';



export default function ExpandingTableRow({key,data,opened,tableType}) {
  const [expanded, setExpanded] = useState(false);
  const [currentData, setCurrentData] = useState(data);
  const [notesToolTipOpen,setNotesToolTipOpen] = useState(false);

  useEffect(() => {
    setCurrentData(data)
  }, [data,currentData,key]);

  const toggleExpander = () => {
    setExpanded(!expanded)
  }

  function ExpandingTableCell(featureName,featureKey,featureValue){
    // Specific styles depending on call key (feature key)
    switch (featureKey){
      case "Download_URL":
        return (
          <>
          <td id="heading" class="top" style={{"whiteSpace":"normal"}}>
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{ <a style={{"color":'blue',"textDecoration":'underline'}} target="_blank" href={featureValue}>Link</a>}</td>
          </>
        )
      case "Readme_URL":
        return (
          <>
          <td id="heading" class="top" style={{"whiteSpace":"normal"}}>
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{<a style={{"color":'blue',"textDecoration":'underline'}}  target="_blank" href={featureValue}>Link</a>}</td>
          </>
        )
      case "Notes":
        return (
          <>
          <td id="heading" class="top" style={{"whiteSpace":"normal","color":'blue',"textDecoration":'underline','cursor':'pointer'}}
          onClick={() => setNotesToolTipOpen(!notesToolTipOpen) }>
                      {" "}
                      {featureName}
                </td>

          {notesToolTipOpen && (
            <span class="tooltiptext">
              {featureValue}
            </span>
          )}

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



  return [
    // NON-EXPANDING/ALWAYS-SHOWING section 
    <tr key="main" onClick={toggleExpander} class="tablerow">
      
      <td class="datacell">
        {tableType.features.filter(obj => (currentData[obj.featureKey] != "" && currentData[obj.featureKey] != undefined)) != [] ? <KeyboardArrowDownIcon id={"rotate" + expanded} /> : <></> }
      </td>
       
      

      {tableType.headers.map(({ headerKey, getReadableString }) => (
        <td class="datacell"  >  {getReadableString(currentData[headerKey])}</td>
      ))}
    </tr>,
    // EXPANDED section
    expanded && (
      <tr class="expandable" key="tr-expander">
        <td className="uk-background-muted" colSpan={6}>
          <div className="inner uk-grid">
            
            {/* Split into pairs so that each row contains two feature infos */}
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