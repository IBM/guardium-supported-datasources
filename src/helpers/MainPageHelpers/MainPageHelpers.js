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
  switch (selected) {
    case "All":
      break;
    case "Guardium Data Protection":
      searchedConnectionData = searchedConnectionData.filter(
        (elem) => elem.gdp_supported_since !== undefined
      );
      break;
    case "Guardium Insights (Software)":
      searchedConnectionData = searchedConnectionData.filter(
        (elem) =>
          elem.supported_since !== "0.0.0" &&
          !elem.supported_since.includes("Planned for")
      );
      break;
    case "Guardium Insights SaaS":
      searchedConnectionData = searchedConnectionData.filter(
        (elem) => elem.saas_supported !== undefined
      );
      break;
    default:
      break;
  }

  return searchedConnectionData;
}
