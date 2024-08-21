import React from "react";
// import "../styles/styles.css";

export default function MainPageLinks() {
  return (
    <div className="links_div">
      <a
        className="raw-data-link"
        href={process.env.PUBLIC_URL + "/data/connections.json"}
        rel="noopener noreferrer"
        target="_blank"
      >
        Raw Data
      </a>
      <a
        className="raw-data-link"
        href="https://github.com/IBM/guardium-supported-datasources/issues/new"
        rel="noopener noreferrer"
        target="_blank"
      >
        Report An Issue
      </a>
    </div>
  );
}
