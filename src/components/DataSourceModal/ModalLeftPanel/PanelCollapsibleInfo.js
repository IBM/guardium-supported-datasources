import React from "react";
import PropTypes from "prop-types";
import { generateAccordianItem } from "../../../helpers/helpers";

// TODO: Split into 3 tooltips

// Collapsible Information Related to current Method, logic is handled using toolTop
// Information is retrieved from summary.json
export default function PanelCollapsibleInfo({
  selectedMethodData,
  toolTipOpen,
  setToolTipOpen,
}) {
  const filteredSections = selectedMethodData.method_info.filter(
    (section) =>
      section.accordian_title === "Setup Instructions" &&
      section.content &&
      section.content[0] != null
  );

  const handleTooltipClick = (index) => {
    setToolTipOpen(toolTipOpen.map((isOpen, i) => (i === index ? !isOpen : false)));
  };

  return (
    <div>
      <br />
      <h6> About {selectedMethodData.method_name}</h6>
      <ul>
        <li onClick={() => handleTooltipClick(0)} className="tooltip" id={`tooltip${toolTipOpen[0]}`}>
          {" "}
          How it works
          {toolTipOpen[0] ? (
            <span className="tooltiptext">
              {generateAccordianItem(
                selectedMethodData.method_info.filter(
                  (section) =>
                    section.accordian_title == "How it works" &&
                    section.content[0] != null
                )[0]
              )}
            </span>
          ) : null}
        </li>
        <br />
        <li onClick={() => handleTooltipClick(1)} className="tooltip" id={`tooltip${toolTipOpen[1]}`}>
          {" "}
          Benefits and Considerations
          {toolTipOpen[1] ? (
            <span className="tooltiptext">
              <h6>Skill Level:</h6>{" "}
              <div>
                {" "}
                {generateAccordianItem(
                  selectedMethodData.method_info.filter(
                    (section) =>
                      section.accordian_title == "Skill Level" &&
                      section.content != null
                  )[0]
                )}
                <br />
              </div>
              <div>
                <h6>Benefits: </h6>{" "}
                {generateAccordianItem(
                  selectedMethodData.method_info.filter(
                    (section) => section.accordian_title == "Benefits"
                  )[0]
                )}
                <br />
              </div>
              <h6>Considerations: </h6>{" "}
              {generateAccordianItem(
                selectedMethodData.method_info.filter(
                  (section) => section.accordian_title == "Considerations"
                )[0]
              )}
              <br />
            </span>
          ) : null}
        </li>
        <br />
        <li onClick={() => handleTooltipClick(2)} className="tooltip" id={`tooltip${toolTipOpen[2]}`}>
          {" "}
          Getting Started
          {toolTipOpen[2] ? (
            <span className="tooltiptext">
              <h6>Information you will need: </h6>
              <div>
                {generateAccordianItem(
                  selectedMethodData.method_info.filter(
                    (section) =>
                      section.accordian_title == "Information you will need" &&
                      section.content[0] != null
                  )[0]
                )}
                <br />
                {
                  filteredSections.length > 0 ? generateAccordianItem(filteredSections[0]) : null
                }
              </div>
            </span>
          ) : null}
        </li>
      </ul>
    </div>
  );
}

// PropTypes validation
PanelCollapsibleInfo.propTypes = {
  selectedMethodData: PropTypes.shape({
    method_name: PropTypes.string.isRequired,
    method_info: PropTypes.arrayOf(
      PropTypes.shape({
        accordian_title: PropTypes.string.isRequired,
        content: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.string),
          PropTypes.string,
          PropTypes.arrayOf(
            PropTypes.shape({
              title: PropTypes.string.isRequired,
            })
          ),
        ]).isRequired,
      })
    ).isRequired,
  }).isRequired, // Object representing the selected method's data
  toolTipOpen: PropTypes.arrayOf(PropTypes.bool).isRequired, // Array of booleans to manage tooltip state
  setToolTipOpen: PropTypes.func.isRequired, // Function to update the tooltip state
};
