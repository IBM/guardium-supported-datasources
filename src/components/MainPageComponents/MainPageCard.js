import React from "react";
import PropTypes from "prop-types";

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

// PropTypes validation
MainPageCard.propTypes = {
  dataSourceData: PropTypes.shape({
    database_name: PropTypes.string.isRequired, 
  }).isRequired,
  setOpen: PropTypes.func.isRequired,
  setSelectedDataSourceData: PropTypes.func.isRequired,
  BLOCK_CLASS: PropTypes.string.isRequired,
};

