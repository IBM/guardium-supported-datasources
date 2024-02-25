import React, { useState, useEffect } from 'react';
import ExpandingTableRow from './ExpandingTableRow';
import { AccordionItem, Dropdown} from '@carbon/ibm-security';

// Compatibility Matrix/Table component
export default function CompatMatrix({initialData,tableType}) {

    const [displayData, setDisplayData] = useState(initialData); // Current Display Data
    
    useEffect(() => {
        console.log(`This is the initiaData: ${JSON.stringify(initialData)}`)
        setDisplayData(initialData)
    },[initialData]);

    function renderTable(){
        return (
          <div>
            
            <table style={{ minWidth: "600px",maxWidth:"800px" }}>
              <thead class="matrixheader">
                <tr>
                  <th className="uk-table-shrink"></th>
                  {tableType.headers.map(({ headerName }) => (
                    <th
                      class="dataheadercell"
                      // onClick={sortByOSVersion}
                    >
                      {headerName}
                      <br />
                      {/* <ArrowDropDownIcon id={"rotate" + (currentSortedOS != 1)} /> */}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayData.map((row, index) => (
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
        <AccordionItem
          open={true}
          key={"Detailed Support Information"}
          title={"Detailed Support Information"}
          size="lg"
          style={{ display: "inline-block" }}
        >
          <br></br>
          {renderTable()}

        </AccordionItem>

    );




}