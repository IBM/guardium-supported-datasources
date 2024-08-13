import React from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function ModalTableHeaders({
  changeSortKeyOnClick,
  tableType,
  sortKey
}) {
  return <thead class="matrixheader">
          <tr>
            <th className="uk-table-shrink"></th>
            {tableType.headers.map(({
        id,
        headerName
      }) => <th style={{
        minWidth: 0,
        whiteSpace: "nowrap"
      }} class="dataheadercell" onClick={() => changeSortKeyOnClick(id)}>
                {headerName}
                <br></br>

                {
          /* Orienation of arrow depends on current sort key for that column */
        }
                {<ArrowDropDownIcon id={sortKey[id] != -0 ? "rotate" + (sortKey[id] != -1) : "rotatemed"} />}

                <br />
              </th>)}
          </tr>
        </thead>;
}
  