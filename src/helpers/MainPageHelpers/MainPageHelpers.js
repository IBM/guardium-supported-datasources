import { fuzzySearchV2 } from "../helpers";

export function transformDatabaseData(supported_databases, methods) {
  return supported_databases.map((database) => ({
    // Spread operator to copy all properties of the current 'database' object
    ...database,

    // Map over each 'environment' in 'environments_supported' array
    environments_supported: database.environments_supported.map(
      (environment) => ({
        // Spread operator to copy all properties of the current 'environment' object
        ...environment,

        // Map over each 'method' in 'methods_supported' array
        methods_supported: environment.methods_supported.map((method) => ({
          // Spread operator to copy all properties of the current 'method' object
          ...method,

          // Merge method data with additional information from 'methods' using 'method_key'
          ...methods[method.method_key],
        })),
      })
    ),
  }));
}

export function handleSearchBar(value, fullConnectionData) {
  const fuzzyOptionsOverride = {
    threshold: 0.25, // closer to 0 improves the quality of the match.
    ignoreLocation: true, // find matches anywhere
    includeMatches: false, // return the matched text
  };

  let searchedConnectionData = value
    ? fuzzySearchV2(
        value,
        fullConnectionData,
        [
          "database_name",
          "environments_supported.environment_name",
          "environments_supported.methods_supported.method_name",
        ],
        fuzzyOptionsOverride
      )
    : fullConnectionData;

  return searchedConnectionData;
}

export function handleProductFilter(selected, searchedConnectionData) {
  const SAAS_ENVS = [
    "AWS (Database as a Service)",
    "Azure (Database as a Service)",
    "GCP (Database as a Service)",
    "IBM Cloud (Database as a Service)",
    "Oracle Cloud (Database as a Service)",
  ];
  switch (selected) {
    case "All":
      break;
    case "Guardium Data Protection":
      searchedConnectionData = searchedConnectionData.filter((elem) =>
        elem.environments_supported.some(
          (env) => env.environment_name === "On-premise or IaaS"
        )
      );
      break;

    case "Guardium Insights":
      searchedConnectionData = searchedConnectionData.filter((item) =>
        item.environments_supported.some((env) =>
          SAAS_ENVS.includes(env.environment_name)
        )
      );
      break;
    default:
      break;
  }

  return searchedConnectionData;
}
