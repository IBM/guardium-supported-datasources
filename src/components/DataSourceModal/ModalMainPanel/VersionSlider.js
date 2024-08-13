import React from "react";
import Slider from '@mui/material/Slider';

export default function VersionSlider({
  GVSliderValue,
  setGVSliderValue,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <p
        style={{
          whiteSpace: "nowrap",
        }}
      >
        Guardium Version
      </p>

      <Slider
        style={{
          width: "50%",
        }}
        label="Guardium Version Change"
        size="small"
        value={GVSliderValue}
        max={12.0}
        min={11.0}
        step={null} // Setting step to null to only allow values defined in marks
        onChange={(event, newGVValue) => {
          setGVSliderValue(newGVValue);
        }}
        valueLabelDisplay="on"
        title="Guardium Version Change"
        marks={[
          {
            value: 11.0,
          },
          {
            value: 11.1,
          },
          {
            value: 11.2,
          },
          {
            value: 11.3,
          },
          {
            value: 11.4,
          },
          {
            value: 11.5,
          },
          {
            value: 12.0,
          },
        ]} // Using marks to indicate allowed values
      />
    </div>
  );
}
