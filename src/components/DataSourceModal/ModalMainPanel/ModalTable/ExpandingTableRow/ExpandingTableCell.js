import React from "react";

export default function ExpandingTableCell({
  featureName,
  featureKey,
  featureValue,
  setNotesToolTipOpen,
  notesToolTipOpen,
}) {
  // Specific styles depending on call key (feature key)
  switch (featureKey) {
    case "Download_URL":
    case "Readme_URL":
      return (
        <>
          <td id="heading" className="top">
            {" "}
            {featureName}
          </td>
          <td className="top">
            {
              <a
                className="tablelink"
                rel="noopener noreferrer"
                target="_blank"
                href={featureValue}
              >
                Link
              </a>
            }
          </td>
        </>
      );
    case "Notes":
      return (
        <>
          <td
            id="notesheading"
            className="top"
            onClick={() => setNotesToolTipOpen(!notesToolTipOpen)}
          >
            {" "}
            {featureName}
          </td>

          {notesToolTipOpen && <td className="top">{featureValue}</td>}
        </>
      );
    default:
      return (
        <>
          <td id="heading" className="top">
            {" "}
            {featureName}
          </td>
          <td className="top">{featureValue}</td>
        </>
      );
  }
}
