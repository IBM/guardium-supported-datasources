import React from "react";
// import "../styles/styles.css";

export default function MainPageLinks() {
  return (
    <div className="links_div">
      <a
        className={`raw-data-link`}
        href={process.env.PUBLIC_URL + "/data/connections.json"}
        target="_blank"
        rel="noopener noreferrer"
      >
        Raw Data
      </a>
      <a
        className={`raw-data-link`}
        href="https://github.com/AhmedMujtabaIBM/guardium-supported-datasources-v2/issues/new"
        target="_blank"
        rel="noopener noreferrer"
      >
        Report An Issue
      </a>
    </div>
  );
}
