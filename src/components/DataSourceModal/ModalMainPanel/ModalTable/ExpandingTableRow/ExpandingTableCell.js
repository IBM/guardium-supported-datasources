import React, { useState, useEffect } from "react";

export default function ExpandingTableCell({
    featureName,
    featureKey,
    featureValue,
    setNotesToolTipOpen,
    notesToolTipOpen
}) {
    // Specific styles depending on call key (feature key)
    switch (featureKey){
      case "Download_URL":
      case "Readme_URL":
        return (
          <>
          <td id="heading" class="top">
                      {" "}
                      {featureName}
                    </td>
          <td class="top" >{<a class="tablelink"  target="_blank" href={featureValue}>Link</a>}</td>
          </>
        )
      case "Notes":
        return (
          <>
          <td id="notesheading" class="top" 
          onClick={() => setNotesToolTipOpen(!notesToolTipOpen) }>
                      {" "}
                      {featureName}
                </td>

          {notesToolTipOpen && (
            <td class="top" >{featureValue}</td>
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