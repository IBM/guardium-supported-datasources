import React from 'react';


export default function LinksDiv({ blockClass }) {
  return (
    <div className="links_div">
      <a
        className={`${blockClass}__raw-data-link`}
        href={process.env.PUBLIC_URL+"/data/connections.json"}
        target="_blank"
        rel="noopener noreferrer"
      >
        Raw Data
      </a>
      <a
        className={`${blockClass}__raw-data-link`}
        href="https://github.com/AhmedMujtabaIBM/guardium-supported-datasources-v2/issues/new"
        target="_blank"
        rel="noopener noreferrer"
      >
        Report An Issue
      </a>
    </div>
  );
}

