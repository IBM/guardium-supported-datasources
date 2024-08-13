import React from "react";

export default function MainPageCard({
  dataSourceData,
  setOpen,
  setSelectedDataSourceData,
  BLOCK_CLASS,
}) {
  return (
    <div className={`bx--col-lg-2`}>
      <div
        className={`${BLOCK_CLASS}__data-source-card`}
        role="button"
        onClick={() => {
          setOpen(true);
          setSelectedDataSourceData(dataSourceData);
        }}
        tabIndex={0}
      >
        <div className={`${BLOCK_CLASS}__data-source-card-title`}>
          {dataSourceData.database_name}
        </div>
      </div>
    </div>
  );
}
