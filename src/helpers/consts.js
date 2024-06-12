import {isNumber,getRangeStringFromList,splitStringsCompare,splitStrings,numericalListCompare} from './helpers'

export const TABLETYPE1 = {
    id: 1,
    headers: [
    {
      id: 0,
      headerName: "Database Version",
      headerKey: "DatabaseVersion",
      sorta: (rowa, rowb) => {
        return numericalListCompare(rowa.DatabaseVersion[0],rowb.DatabaseVersion[0],
          rowa.DatabaseVersion[rowa.DatabaseVersion.length -1],rowb.DatabaseVersion[rowb.DatabaseVersion.length -1]);
      },
      sortd: (rowb, rowa) => {
        return numericalListCompare(rowa.DatabaseVersion[0],rowb.DatabaseVersion[0],
          rowa.DatabaseVersion[rowa.DatabaseVersion.length -1],rowb.DatabaseVersion[rowb.DatabaseVersion.length -1]);
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 1,
      headerName: "Guardium Version",
      headerKey: "GuardiumVersion",
      sorta: (rowa, rowb) => {
        
        return numericalListCompare(rowa.GuardiumVersion[0],rowb.GuardiumVersion[0],
          rowa.GuardiumVersion[rowa.GuardiumVersion.length -1],rowb.GuardiumVersion[rowb.GuardiumVersion.length -1]);
      },
      sortd: (rowb, rowa) => {
        
        return numericalListCompare(rowa.GuardiumVersion[0],rowb.GuardiumVersion[0],
          rowb.GuardiumVersion[rowb.GuardiumVersion.length -1],rowa.GuardiumVersion[rowa.GuardiumVersion.length -1]);
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
      },
    },
    {
      id: 2,
      headerName: "OS Version",
      headerKey: "OSVersion",
      sorta: (rowa, rowb) => {
        return rowa.OSVersion[0].localeCompare(
          rowb.OSVersion[0]
        );
      },
      sortd: (rowb, rowa) => {
        return rowa.OSVersion[0].localeCompare(
          rowb.OSVersion[0]
        );
      },
      getReadableString: (lsta) => {
        return getRangeStringFromList(lsta);
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
  
    },{
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
    }
  ],
  }
  ;
  
  
export  const TABLETYPE2 = {
    id: 2,
    headers: [
      {
        id: 0,
        headerName: "Guardium Version",
        headerKey: "Guardium_Version",
        sorta: (rowa, rowb) => {
          return numericalListCompare(rowa.Guardium_Version[0],rowb.Guardium_Version[0],
            rowa.Guardium_Version[rowa.Guardium_Version.length -1],rowb.Guardium_Version[rowb.Guardium_Version.length -1]);
        },
        sortd: (rowb, rowa) => {
          return numericalListCompare(rowa.Guardium_Version[0],rowb.Guardium_Version[0],
            rowa.Guardium_Version[rowa.Guardium_Version.length -1],rowb.Guardium_Version[rowb.Guardium_Version.length -1]);
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
          return numericalListCompare(rowa.DataSource_Version[0],rowb.DataSource_Version[0],
            rowa.DataSource_Version[rowa.DataSource_Version.length -1],rowb.DataSource_Version[rowb.DataSource_Version.length -1]);
        },
        sortd: (rowb, rowa) => {
          return numericalListCompare(rowa.DataSource_Version[0],rowb.DataSource_Version[0],
            rowa.DataSource_Version[rowa.DataSource_Version.length -1],rowb.DataSource_Version[rowb.DataSource_Version.length -1]);
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
          return rowa.VA_supported[0].localeCompare(
            rowb.VA_supported[0]
          );
        },
        sortd: (rowb, rowa) => {
          return rowa.VA_supported[0].localeCompare(
            rowb.VA_supported[0]
          );
        },
        getReadableString: (str) => {return str}
    
      },
      {
        featureName: "Classification Supported",
        featureKey: "Classification_supported",
        getReadableString: (str) => {return str}
    
      },
      {
        featureName: "Download URL",
        featureKey: "Download_URL",
        getReadableString: (str) => {return str}
    
      },
      {
        featureName: "ReadMe URL",
        featureKey: "Readme_URL",
        getReadableString: (str) => {return str}
    
      },
      {
        featureName: "Notes",
        featureKey: "Notes",
        getReadableString: (str) => {return str}
      }
  ]
  };
  
export  const getJSONData = (environment,method) => {
    let key = `${environment}|${method}`
    console.log(`This is the key: ${key}`)
    switch (key){
      case "AWS (Database as a Service)|Amazon Kinesis":
        return [require(`../data/consolidated_csvs/AWS_AmKin.json`),TABLETYPE2]
      case "AWS (Database as a Service)|External STAP":
        return [require(`../data/consolidated_csvs/AWS_ExStap.json`),TABLETYPE2]
      case "AWS (Database as a Service)|Universal Connector":
        return [require(`../data/consolidated_csvs/AWS_UC.json`),TABLETYPE2]
      case "Azure (Database as a Service)|Azure Event Hubs":
        return [require(`../data/consolidated_csvs/Azure_AzEvHub.json`),TABLETYPE2]
      case "Azure (Database as a Service)|External STAP":
        return [require(`../data/consolidated_csvs/Azure_ExStap.json`),TABLETYPE2]
      case "Azure (Database as a Service)|Universal Connector":
        return [require(`../data/consolidated_csvs/Azure_UC.json`),TABLETYPE2]
      case "GCP (Database as a Service)|External STAP":
        return [require(`../data/consolidated_csvs/GCP_ExStap.json`),TABLETYPE2]
      case "GCP (Database as a Service)|Universal Connector":
        return [require(`../data/consolidated_csvs/GCP_UC.json`),TABLETYPE2]
      case "IBM Cloud (Database as a Service)|External STAP":
        return [require(`../data/consolidated_csvs/IBMCloud_ExStap.json`),TABLETYPE2]
      case "IBM Cloud (Database as a Service)|Universal Connector":
        return [require(`../data/consolidated_csvs/IBMCloud_UC.json`),TABLETYPE2]
      case "On-premise or IaaS|STAP":
        return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLETYPE1]
      case "On-premise or IaaS|External STAP": //TODO:What is this??
        return [require(`../data/consolidated_csvs/OnPrem_Stap.json`),TABLETYPE1] 
      case "On-premise or IaaS|Universal Connector":
        return [require(`../data/consolidated_csvs/OnPrem_UC.json`),TABLETYPE1]
      case "Oracle Cloud (Database as a Service)|External STAP":
        return [require(`../data/consolidated_csvs/OracleCloud_ExStap.json`),TABLETYPE2]
  
      default:
        console.log(`This is the error key: ${key}`)
        return [null,null]
        
    } 
  
  }