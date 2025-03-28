import { getRangeStringFromList, numericalListCompare } from "./helpers";
import PropTypes from "prop-types";

export const TABLETYPE1 = {
  id: 1,
  headers: [
    {
      id: 0,
      headerName: "Database Version",
      headerKey: "DatabaseVersion",
      sorta: (rowa, rowb) => {
        return numericalListCompare(
          rowa.DatabaseVersion[0],
          rowb.DatabaseVersion[0],
          rowa.DatabaseVersion[rowa.DatabaseVersion.length - 1],
          rowb.DatabaseVersion[rowb.DatabaseVersion.length - 1]
        );
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(
          rowa.DatabaseVersion[0],
          rowb.DatabaseVersion[0],
          rowa.DatabaseVersion[rowa.DatabaseVersion.length - 1],
          rowb.DatabaseVersion[rowb.DatabaseVersion.length - 1]
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
        // return lsta.join(", ");
      },
    },
    {
      id: 1,
      headerName: "Guardium Version",
      headerKey: "GuardiumVersion",
      sorta: (rowa, rowb) => {
        return numericalListCompare(
          rowa.GuardiumVersion[0],
          rowb.GuardiumVersion[0],
          rowa.GuardiumVersion[rowa.GuardiumVersion.length - 1],
          rowb.GuardiumVersion[rowb.GuardiumVersion.length - 1]
        );
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(
          rowa.GuardiumVersion[0],
          rowb.GuardiumVersion[0],
          rowb.GuardiumVersion[rowb.GuardiumVersion.length - 1],
          rowa.GuardiumVersion[rowa.GuardiumVersion.length - 1]
        );
      },
      getReadableString: (lsta) => {
        return lsta?.join(", ");
      },
    },
    {
      id: 2,
      headerName: "OS Version",
      headerKey: "OSVersion",
      sorta: (rowa, rowb) => {
        return rowa.OSVersion[0].localeCompare(rowb.OSVersion[0]);
      },
      sortd: (rowb, rowa) => {
        return rowa.OSVersion[0].localeCompare(rowb.OSVersion[0]);
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
        // return lsta.join(", ");
      },
    },
  ],
  features: [
    {
      featureName: "Network Traffic",
      featureKey: "Network traffic",
    },
    {
      featureName: "Encrypted Traffic",
      featureKey: "Encrypted traffic",
    },
    {
      featureName: "Shared Memory",
      featureKey: "Shared Memory",
    },
    {
      featureName: "Kerberos",
      featureKey: "Kerberos",
    },
    {
      featureName: "Blocking",
      featureKey: "Blocking",
    },
    {
      featureName: "Redaction",
      featureKey: "Redaction",
    },
    {
      featureName: "UID Chain",
      featureKey: "UID Chain",
    },
    {
      featureName: "Compression",
      featureKey: "Compression",
    },
    {
      featureName: "Query Rewrite",
      featureKey: "Query Rewrite",
    },
    {
      featureName: "Instance Discovery",
      featureKey: "Instance Discovery",
    },
    {
      featureName: "Protocol",
      featureKey: "Protocol",
    },
    {
      featureName: "Notes",
      featureKey: "Notes",
    },
  ],
};

export const TABLETYPE2 = {
  id: 2,
  headers: [
    {
      id: 0,
      headerName: "Guardium Version",
      headerKey: "Guardium_Version",
      sorta: (rowa, rowb) => {
        return numericalListCompare(
          rowa.Guardium_Version[0],
          rowb.Guardium_Version[0],
          rowa.Guardium_Version[rowa.Guardium_Version.length - 1],
          rowb.Guardium_Version[rowb.Guardium_Version.length - 1]
        );
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(
          rowa.Guardium_Version[0],
          rowb.Guardium_Version[0],
          rowa.Guardium_Version[rowa.Guardium_Version.length - 1],
          rowb.Guardium_Version[rowb.Guardium_Version.length - 1]
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 1,
      headerName: "Database Version",
      headerKey: "DataSource_Version",
      sorta: (rowa, rowb) => {
        return numericalListCompare(
          rowa.DataSource_Version[0],
          rowb.DataSource_Version[0],
          rowa.DataSource_Version[rowa.DataSource_Version.length - 1],
          rowb.DataSource_Version[rowb.DataSource_Version.length - 1]
        );
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(
          rowa.DataSource_Version[0],
          rowb.DataSource_Version[0],
          rowa.DataSource_Version[rowa.DataSource_Version.length - 1],
          rowb.DataSource_Version[rowb.DataSource_Version.length - 1]
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
  ],
  features: [
    {
      featureName: "VA Supported",
      featureKey: "VA_supported",
      sorta: (rowa, rowb) => {
        return rowa.VA_supported[0].localeCompare(rowb.VA_supported[0]);
      },
      sortd: (rowb, rowa) => {
        return rowa.VA_supported[0].localeCompare(rowb.VA_supported[0]);
      },
      getReadableString: (str) => {
        return str;
      },
    },
    {
      featureName: "Classification Supported",
      featureKey: "Classification_supported",
      getReadableString: (str) => {
        return str;
      },
    },
    {
      featureName: "Download URL",
      featureKey: "Download_URL",
      getReadableString: (str) => {
        return str;
      },
    },
    {
      featureName: "ReadMe URL",
      featureKey: "Readme_URL",
      getReadableString: (str) => {
        return str;
      },
    },
    {
      featureName: "Notes",
      featureKey: "Notes",
      getReadableString: (str) => {
        return str;
      },
    },
  ],
};

// Define the PropTypes for a single header
const TableTypeHeaderPropType = PropTypes.shape({
  id: PropTypes.number.isRequired, // Unique identifier for the header
  headerName: PropTypes.string.isRequired, // Display name of the header
  headerKey: PropTypes.string.isRequired, // Key to access the corresponding data in rows
  sorta: PropTypes.func.isRequired, // Function for ascending sort
  sortd: PropTypes.func.isRequired, // Function for descending sort
  getReadableString: PropTypes.func.isRequired, // Function to format data into a readable string
});

// Define the PropTypes for a single feature
const TableTypeFeaturePropType = PropTypes.shape({
  featureName: PropTypes.string.isRequired, // Display name of the feature
  featureKey: PropTypes.string.isRequired, // Key to access the corresponding data in rows
});

// Define the PropTypes for tableType
export const TableTypePropType = PropTypes.shape({
  id: PropTypes.number.isRequired, // Numeric identifier for table type
  headers: PropTypes.arrayOf(TableTypeHeaderPropType).isRequired, // Array of header objects
  features: PropTypes.arrayOf(TableTypeFeaturePropType).isRequired, // Array of feature objects
});

export const getJSONData = (environment, method) => {
  let key = `${environment}|${method}`;
  
  switch (key) {
    case "AWS (Database as a Service)|Amazon Kinesis":
      return [require(`../data/consolidated_jsons/AWS_AmKin.json`), TABLETYPE2];
    case "AWS (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/AWS_ExStap.json`),
        TABLETYPE2,
      ];
    case "AWS (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_jsons/AWS_UC.json`), TABLETYPE2];
    case "Azure (Database as a Service)|Azure Event Hubs":
      return [
        require(`../data/consolidated_jsons/Azure_AzEvHub.json`),
        TABLETYPE2,
      ];
    case "Azure (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/Azure_ExStap.json`),
        TABLETYPE2,
      ];
    case "Azure (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_jsons/Azure_UC.json`), TABLETYPE2];
    case "GCP (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/GCP_ExStap.json`),
        TABLETYPE2,
      ];
    case "GCP (Database as a Service)|Universal Connector":
      return [require(`../data/consolidated_jsons/GCP_UC.json`), TABLETYPE2];
    case "IBM Cloud (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/IBMCloud_ExStap.json`),
        TABLETYPE2,
      ];
    case "IBM Cloud (Database as a Service)|Universal Connector":
      return [
        require(`../data/consolidated_jsons/IBMCloud_UC.json`),
        TABLETYPE2,
      ];
    case "On-premise or IaaS|STAP":
      return [
        require(`../data/consolidated_jsons/OnPrem_Stap.json`),
        TABLETYPE1,
      ];
    case "On-premise or IaaS|External STAP":
      return [
        require(`../data/consolidated_jsons/OnPrem_ExStap.json`),
        TABLETYPE2,
      ];
    case "On-premise or IaaS|Universal Connector":
      return [require(`../data/consolidated_jsons/OnPrem_UC.json`), TABLETYPE2];
    case "Oracle Cloud (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/OracleCloud_ExStap.json`),
        TABLETYPE2,
      ];
    case "Oracle Cloud (Database as a Service)|Universal Connector":
      return [
        require(`../data/consolidated_jsons/OracleCloud_UC.json`),
        TABLETYPE2,
      ];
    case "SAP Cloud (Database as a Service)|External STAP":
      return [
        require(`../data/consolidated_jsons/SAPCloud_ExStap.json`),
        TABLETYPE2,
      ];

    default:
      console.log(`This is the error key: ${key}`);
      return [null, null];
  }
};

export const BLOCK_CLASS = `connections-doc`;

export const PRODUCTS = [
  "All",
  "Guardium Data Protection",
  "Guardium Data Security Center",
];

const {
  GV_RANGE: guardiumVersions,
} = require("../data/consolidated_jsons/GuardiumVersions.json");
export const DEFAULT_GV_RANGE = [
  guardiumVersions[0],
  guardiumVersions[guardiumVersions.length - 1],
];

const jsonData =  require(`../data/consolidated_jsons/OnPrem_Stap.json`);
export const UNIQUE_OS_NAMES = ["All",
  ...new Set(
      Object.values(jsonData) // Get all arrays from the JSON object
          .flat() // Flatten the arrays into a single array of objects
          .flatMap(item => item.OSName).sort() // Extract OSName arrays and flatten them
  )
];
export const AGENT_OS  = Object.fromEntries(
  Object.entries(jsonData).map(([key, value]) => [
      key,
      value.map(item => item.OSName[0]) // Extract the first OSName from each object
  ])
);


export const DEFAULT_GDP_VERSIONS = guardiumVersions;

export const DEFAULT_OS_DROPDOWN_VALUE = "All";
