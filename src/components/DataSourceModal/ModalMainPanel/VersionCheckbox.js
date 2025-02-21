import React from "react";
import { Button } from "@mui/material";

// Directly load the JSON data
// const jsonData = require("../../../data/consolidated_jsons/GuardiumVersions.json");
// const guardiumVersions = jsonData.GuardVersions;
import { DEFAULT_GDP_VERSIONS } from "../../../helpers/consts";

export default function VersionCheckbox({
  GDPVersions,
  filterSelectedGDPVersion,
  setGDPVersions,
}) {
  const handleChange = (event) => {
    const { value, checked } = event.target;
    filterSelectedGDPVersion(value, checked);
  };

  return (
    <div className="checkbox-container">
      <p className="VersionSliderHeader">Guardium Version</p>

      {DEFAULT_GDP_VERSIONS.map((ver) => (
        <label key={ver} className="version-checkbox-label">
          <input
            type="checkbox"
            value={ver}
            checked={GDPVersions.includes(ver)}
            onChange={handleChange}
          />
          {ver}
        </label>
      ))}
      <Button
        variant="outlined"
        sx={{ fontSize: "10px", padding: "4px 8px", minWidth: "auto" }}
        onClick={() => setGDPVersions(DEFAULT_GDP_VERSIONS)}
      >
        Select all
      </Button>
    </div>
  );
}
