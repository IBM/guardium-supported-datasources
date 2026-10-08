import React from "react";
// DataSyncInfo is kept for code-assistant reference: GDP 12.2.4, UC v1.7.3, last synced 2025-10-05
// const syncInfo = require("../../data/DataSyncInfo.json");

const { supported_databases } = require("../../data/summary.json");
const { datasources: vaDatasources } = require("../../data/VA_datasources.json");
const { datasources: udcDatasources } = require("../../data/UDC_datasources.json");

// Include capability-only datasources (VA/UDC-only, no monitoring method) in the export
const monitoringNames = new Set(supported_databases.map((d) => d.database_name));
const capabilityOnlyNames = [...new Set([
  ...Object.entries(vaDatasources),
  ...Object.entries(udcDatasources),
].filter(([name, data]) => data.capability_only === true && !monitoringNames.has(name))
 .map(([name]) => name))];
const all_databases = [
  ...supported_databases,
  ...capabilityOnlyNames.map((name) => ({ database_name: name, environments_supported: [] })),
];

function openAllDatasourcesJSON() {
  const payload = all_databases.map((db) => ({
    ...db,
    va: vaDatasources[db.database_name] ?? { va_supported: false },
    udc: udcDatasources[db.database_name] ?? { udc_supported: false },
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
}

export default function MainPageFooter() {
  return (
    <div className="main-page-footer">
      <div className="main-page-footer-left">
        <a
          className="main-page-footer-link"
          href="#"
          onClick={(e) => { e.preventDefault(); openAllDatasourcesJSON(); }}
        >
          View all datasources as JSON
        </a>
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
