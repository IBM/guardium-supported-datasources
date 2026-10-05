import React from "react";
const syncInfo = require("../../data/DataSyncInfo.json");

export default function MainPageFooter() {
  return (
    <div className="main-page-footer">
      <div className="main-page-footer-left">
        Data last synced against{" "}
        <strong>GDP {syncInfo.gdp_release}</strong>
        {syncInfo.uc_release ? (
          <>
            {" "}and <strong>UC {syncInfo.uc_release}</strong>
          </>
        ) : null}
        {" "}on <strong>{syncInfo.last_synced}</strong>.
      </div>
      <div className="main-page-footer-right">
        <a
          className="main-page-footer-link"
          href="https://github.com/IBM/guardium-supported-datasources/issues/new"
          rel="noopener noreferrer"
          target="_blank"
        >
          Report An Issue
        </a>
      </div>
    </div>
  );
}
