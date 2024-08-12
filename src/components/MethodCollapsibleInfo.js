import React from "react";
import { generateAccordianItem } from '../helpers/helpers';

// Collapsible Information Related to current Method, logic is handled using toolTop
// Information is retrieved from connections.json
export default function MethodSpecificInfo({ selectedMethodData, toolTipOpen,setToolTipOpen, }) {
  return (
    <div>
      <br></br>
      <h6> About {selectedMethodData.method_name}</h6>
      <ul>
        <li
          onClick={() =>
            setToolTipOpen([!toolTipOpen[0], toolTipOpen[1], toolTipOpen[2]])
          }
          class="tooltip"
        >
          {" "}
          How it works
          {toolTipOpen[0] && (
            <span class="tooltiptext">
              {generateAccordianItem(
                selectedMethodData.method_info.filter(
                  (section) =>
                    section.accordian_title == "How it works" &&
                    section.content[0] != null
                )[0]
              )}
            </span>
          )}
        </li>
        <br></br>

        <li
          onClick={() =>
            setToolTipOpen([toolTipOpen[0], !toolTipOpen[1], toolTipOpen[2]])
          }
          class="tooltip"
        >
          {" "}
          Benefits and Considerations
          {toolTipOpen[1] && (
            <span class="tooltiptext">
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
                <br></br>
              </div>
              <div>
                <h6>Benefits: </h6>{" "}
                {generateAccordianItem(
                  selectedMethodData.method_info.filter(
                    (section) => section.accordian_title == "Benefits"
                  )[0]
                )}
                <br></br>
              </div>
              <h6>Considerations: </h6>{" "}
              {generateAccordianItem(
                selectedMethodData.method_info.filter(
                  (section) => section.accordian_title == "Considerations"
                )[0]
              )}
              <br></br>
            </span>
          )}
        </li>
        <br></br>
        <li
          class="tooltip"
          onClick={() =>
            setToolTipOpen([toolTipOpen[0], toolTipOpen[1], !toolTipOpen[2]])
          }
        >
          {" "}
          Getting Started
          {toolTipOpen[2] && (
            <span class="tooltiptext">
              <h6>Information you will need: </h6>
              <div>
                {generateAccordianItem(
                  selectedMethodData.method_info.filter(
                    (section) =>
                      section.accordian_title == "Information you will need" &&
                      section.content[0] != null
                  )[0]
                )}
              </div>
            </span>
          )}
        </li>
      </ul>
    </div>
  );
}
