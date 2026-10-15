import { getRangeStringFromList, numericalListCompare } from "./helpers";
import PropTypes from "prop-types";

// JSON data imports (static — Vite bundles these at build time)
import AWS_AmKin from "../data/consolidated_jsons/AWS_AmKin.json";
import AWS_ExStap from "../data/consolidated_jsons/AWS_ExStap.json";
import AWS_UC from "../data/consolidated_jsons/AWS_UC.json";
import AWS_UC2 from "../data/consolidated_jsons/AWS_UC2.json";
import Azure_AzEvHub from "../data/consolidated_jsons/Azure_AzEvHub.json";
import Azure_ExStap from "../data/consolidated_jsons/Azure_ExStap.json";
import Azure_UC from "../data/consolidated_jsons/Azure_UC.json";
import Azure_UC2 from "../data/consolidated_jsons/Azure_UC2.json";
import GCP_ExStap from "../data/consolidated_jsons/GCP_ExStap.json";
import GCP_UC from "../data/consolidated_jsons/GCP_UC.json";
import GCP_UC2 from "../data/consolidated_jsons/GCP_UC2.json";
import IBMCloud_ExStap from "../data/consolidated_jsons/IBMCloud_ExStap.json";
import IBMCloud_UC from "../data/consolidated_jsons/IBMCloud_UC.json";
import IBMCloud_UC2 from "../data/consolidated_jsons/IBMCloud_UC2.json";
import OnPrem_Stap from "../data/consolidated_jsons/OnPrem_Stap.json";
import OnPrem_ExStap from "../data/consolidated_jsons/OnPrem_ExStap.json";
import OnPrem_UC from "../data/consolidated_jsons/OnPrem_UC.json";
import OnPrem_UC2 from "../data/consolidated_jsons/OnPrem_UC2.json";
import OracleCloud_ExStap from "../data/consolidated_jsons/OracleCloud_ExStap.json";
import OracleCloud_UC from "../data/consolidated_jsons/OracleCloud_UC.json";
import OracleCloud_UC2 from "../data/consolidated_jsons/OracleCloud_UC2.json";
import SAPCloud_ExStap from "../data/consolidated_jsons/SAPCloud_ExStap.json";
import CouchbaseCapellaCloud_UC from "../data/consolidated_jsons/CouchbaseCapellaCloud_UC.json";
import GuardiumVersions from "../data/consolidated_jsons/GuardiumVersions.json";

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
      return [AWS_AmKin, TABLETYPE2];
    case "AWS (Database as a Service)|External STAP":
      return [AWS_ExStap, TABLETYPE2];
    case "AWS (Database as a Service)|Universal Connector":
      return [AWS_UC, TABLETYPE2];
    case "AWS (Database as a Service)|Universal Connector 2.0":
      return [AWS_UC2, TABLETYPE2];
    case "Azure (Database as a Service)|Azure Event Hubs":
      return [Azure_AzEvHub, TABLETYPE2];
    case "Azure (Database as a Service)|External STAP":
      return [Azure_ExStap, TABLETYPE2];
    case "Azure (Database as a Service)|Universal Connector":
      return [Azure_UC, TABLETYPE2];
    case "Azure (Database as a Service)|Universal Connector 2.0":
      return [Azure_UC2, TABLETYPE2];
    case "GCP (Database as a Service)|External STAP":
      return [GCP_ExStap, TABLETYPE2];
    case "GCP (Database as a Service)|Universal Connector":
      return [GCP_UC, TABLETYPE2];
    case "GCP (Database as a Service)|Universal Connector 2.0":
      return [GCP_UC2, TABLETYPE2];
    case "IBM Cloud (Database as a Service)|External STAP":
      return [IBMCloud_ExStap, TABLETYPE2];
    case "IBM Cloud (Database as a Service)|Universal Connector":
      return [IBMCloud_UC, TABLETYPE2];
    case "IBM Cloud (Database as a Service)|Universal Connector 2.0":
      return [IBMCloud_UC2, TABLETYPE2];
    case "On-premise or IaaS|STAP":
      return [OnPrem_Stap, TABLETYPE1];
    case "On-premise or IaaS|External STAP":
      return [OnPrem_ExStap, TABLETYPE2];
    case "On-premise or IaaS|Universal Connector":
      return [OnPrem_UC, TABLETYPE2];
    case "On-premise or IaaS|Universal Connector 2.0":
      return [OnPrem_UC2, TABLETYPE2];
    case "Oracle Cloud (Database as a Service)|External STAP":
      return [OracleCloud_ExStap, TABLETYPE2];
    case "Oracle Cloud (Database as a Service)|Universal Connector":
      return [OracleCloud_UC, TABLETYPE2];
    case "Oracle Cloud (Database as a Service)|Universal Connector 2.0":
      return [OracleCloud_UC2, TABLETYPE2];
    case "SAP Cloud (Database as a Service)|External STAP":
      return [SAPCloud_ExStap, TABLETYPE2];
    case "CouchbaseCapella Cloud (Database as a Service)|Universal Connector":
      return [CouchbaseCapellaCloud_UC, TABLETYPE2];

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

const { GV_RANGE: guardiumVersions } = GuardiumVersions;
export const DEFAULT_GV_RANGE = [
  guardiumVersions[0],
  guardiumVersions[guardiumVersions.length - 1],
];

const { GV_RANGE: _gv } = GuardiumVersions;
export const DEFAULT_GDP_VERSIONS = _gv;

export const UNIQUE_OS_NAMES = ["All",
  ...new Set(
      Object.values(OnPrem_Stap)
          .flat()
          .flatMap(item => item.OSName).sort()
  )
];
export const AGENT_OS = Object.fromEntries(
  Object.entries(OnPrem_Stap).map(([key, value]) => [
      key,
      value.map(item => item.OSName[0])
  ])
);

export const DEFAULT_OS_DROPDOWN_VALUE = "All";
