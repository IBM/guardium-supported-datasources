import React from "react";
import Slider from "@mui/material/Slider";

// Directly load the JSON data
const { GV_RANGE: guardiumVersions } = require("../../../data/consolidated_jsons/GuardiumVersions.json");

export default function VersionSlider({ GVSliderValue, setGVSliderValue }) {
  const minVersion = Number(guardiumVersions[0]);
  const maxVersion = Number(guardiumVersions[guardiumVersions.length - 1]);
  const marks = guardiumVersions.map((version) => ({ value: Number(version) }));

  return (
    <div className="VersionSliderDiv">
      <p className="VersionSliderHeader">Guardium Version</p>
      <Slider
        className="VersionSlider"
        label="Guardium Version Change"
        size="small"
        value={GVSliderValue}
        max={maxVersion}
        min={minVersion}
        step={null}
        onChange={(event, newGVValue) => setGVSliderValue(newGVValue)}
        valueLabelDisplay="on"
        title="Guardium Version Change"
        marks={marks}
      />
    </div>
  );
}
