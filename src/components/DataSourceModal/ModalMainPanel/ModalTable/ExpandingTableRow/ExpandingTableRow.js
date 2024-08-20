import React, { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { splitIntoPairs } from '../../../../../helpers/helpers';
import ExpandingTableCell from './ExpandingTableCell';


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
              
                {splitIntoPairs(tableType.features.filter(obj => (currentData[obj.featureKey] != "" && currentData[obj.featureKey] != undefined))).map((a) => (
                  <tr>
                    
                    <ExpandingTableCell featureName={a[0].featureName}
                                         featureKey={a[0].featureKey}
                                         featureValue={currentData[a[0].featureKey]}
                                        setNotesToolTipOpen={setNotesToolTipOpen}
                                        notesToolTipOpen={notesToolTipOpen}/>
                    
                    <ExpandingTableCell featureName={a[1].featureName}
                                         featureKey={a[1].featureKey}
                                         featureValue={currentData[a[1].featureKey]}
                                         setNotesToolTipOpen={setNotesToolTipOpen}
                                        notesToolTipOpen={notesToolTipOpen}/>
                                        
                  </tr>
                ))}
                
              </table>
            
          </div>
        </td>
      </tr>
    ),
  ];
}