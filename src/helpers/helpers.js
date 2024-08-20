import Fuse from "fuse.js";
import {
  OrderedList,
  ListItem,
  UnorderedList,
  Link,
} from "@carbon/ibm-security";
import React from "react";

export function isNumber(str) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}

/**
 * Generates a string representing the range of versions from a sorted contiguous list of version strings.
 *
 * If the list contains only one version, that version is returned.
 * If the list contains more than one version, a range is returned in the format "first_version - last_version".
 * If the list is empty or null, an empty string is returned.
 *
 * @param {string[]} versionList - A list of version strings to be sorted and processed.
 * @returns {string} A string representing the range of versions.
 *
 * @example
 * // Single version in the list
 * getRangeStringFromList(["2.0.0"]);
 * // Returns: "2.0.0"
 *
 * @example
 * // Multiple versions in the list
 * getRangeStringFromList(["1.2.3", "1.2.5", "1.2.4"]);
 * // Returns: "1.2.3 - 1.2.5"
 *
 * @example
 * // Null input
 * getRangeStringFromList(null);
 * // Returns: ""
 *
 * @example
 * // Empty list
 * getRangeStringFromList([]);
 * // Returns: ""
 */
export const getRangeStringFromList = (versionList) => {
  if (versionList === null) {
    return "";
  }

  versionList.sort((a, b) => {
    return compareOrderedLists(
      splitStringIntoArray(a),
      splitStringIntoArray(b)
    );
  });

  if (versionList.length === 1) {
    return versionList[0];
  } else if (versionList.length > 1) {
    return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
  }
  return "";
};

/**
 * Compares two ordered and contiguous lists of strings or numbers element by element.
 *
 * This function assumes that the input lists are both ordered and contiguous, meaning that the elements
 * follow each other without gaps. The function compares the lists by iterating through each element,
 * and returns:
 * - 0 if both lists are equal,
 * - 1 if the first list is greater,
 * - -1 if the second list is greater.
 *
 * The comparison is performed element by element. If the elements are numbers, they are compared numerically.
 * If the elements are strings, they are compared lexicographically.
 *
 * @param {(string|number)[]} lstStr1 - The first list of ordered, contiguous strings or numbers to compare.
 * @param {(string|number)[]} lstStr2 - The second list of ordered, contiguous strings or numbers to compare.
 * @returns {number} - Returns 1 if lstStr1 is greater, -1 if lstStr2 is greater, or 0 if they are equal.
 *
 * @example
 * // Both lists are equal
 * compareOrderedLists(["1", "2", "3"], ["1", "2", "3"]);
 * // Returns: 0
 *
 * @example
 * // The second list is greater at the first differing element ("apple" < "banana")
 * compareOrderedLists(["apple", "banana", "cherry"], ["apple", "cherry", "date"]);
 * // Returns: -1
 *
 * @example
 * // Lists of mixed types, comparing numbers before strings
 * compareOrderedLists([1, 2, "apple"], [1, 2, "banana"]);
 * // Returns: -1 (since "apple" < "banana" lexicographically)
 */
export function compareOrderedLists(lstStr1, lstStr2) {
  // Base case: If the first list is empty
  if (lstStr1.length == 0) {
    // If both lists are empty, they are considered equal
    if (lstStr2.length == 0) {
      return 0;
    } else {
      // If only the first list is empty, the second list is greater
      return -1;
    }
  }

  // If the first elements of both lists are equal, compare the remaining elements
  if (lstStr1[0] == lstStr2[0]) {
    return compareOrderedLists(lstStr1.slice(1), lstStr2.slice(1));
  }

  // Compare numerical elements numerically
  if (isNumber(lstStr1[0]) && isNumber(lstStr2[0])) {
    if (Number(lstStr1[0]) >= Number(lstStr2[0])) {
      return 1;
    } else {
      return -1;
    }
  } else {
    // Compare non-numerical elements lexicographically
    return lstStr1[0].localeCompare(lstStr2[0]);
  }
}

/**
 * Splits a string into an array of substrings based on spaces, dots, or hyphens.
 *
 * This function uses a regular expression to split a string into components,
 * which can be useful for processing version strings or other delimited data.
 *
 * @param {string} str1 - The string to be split into substrings.
 * @returns {string[]} An array of substrings derived from the input string.
 *
 * @example
 * splitStrings("1.2.3");
 * // Returns: ["1", "2", "3"]
 *
 * @example
 * splitStrings("version-1.0.0");
 * // Returns: ["version", "1", "0", "0"]
 *
 * @example
 * splitStrings("hello-world");
 * // Returns: ["hello", "world"]
 */
export function splitStringIntoArray(str1) {
  // Define the regular expression to match spaces, dots, or hyphens
  const regex = /[ -]+/;

  // Split the strings using the regex
  const list1 = str1.split(regex);

  // Return the arrays of substrings
  return list1;
}

/**
 * Compares two numerical ranges represented by strings. If the first value of the ranges are equal, 
 * it falls back to a secondary comparison.
 * 
 * The function first removes any substrings within parentheses, extracts and sums all 
 * numbers found within the cleaned strings, and then compares these sums.
 * 
 * If the sums are equal, it recursively compares a the last values of the ranges. 
 * If all comparisons yield equality, the first range is considered larger
 * 
 * @param {string} rangeA1 - The first string representing the primary range to compare.
 * @param {string} rangeB1 - The second string representing the primary range to compare.
 * @param {string} rangeA2 - The first string representing the secondary range to compare (used if the primary comparison is equal).
 * @param {string} rangeB2 - The second string representing the secondary range to compare (used if the primary comparison is equal).
 * @returns {number} - Returns 1 if the first range is greater, -1 if the second range is greater, or the result of a secondary comparison if they are equal.

 * @example
 * numericalListCompare("1.5 (low)", "2.3 (medium)", "0.5", "1.0");
 * // Returns: -1
 * 
 * @example
 * numericalListCompare("3.0", "2.5", "1.0", "1.5");
 * // Returns: 1
 * 
 * @example
 * Equal ranges
 * numericalListCompare("2.0 (low)", "2.0 (medium)", "1.0", "1.0");
 * // Returns: -1
 * 
 * @example
 * // First comparison: 1.1 + 1.2 == 1.0 + 1.3, so it falls back to secondary comparison
 * // Secondary comparison: 2.0 > 1.0, so it returns 1
 * numericalListCompare("1.1, 1.2", "1.0, 1.3", "2.0", "1.0");
 * // Returns: 1 
*/
export function numericalListCompare(rangeA1, rangeB1, rangeA2, rangeB2) {
  // Regular expression to match substrings between parentheses
  const regex = /\([^)]*\)/g;

  // Remove substrings between parentheses
  const cleanStr1 = rangeA1.replace(regex, "").trim();
  const cleanStr2 = rangeB1.replace(regex, "").trim();

  // Extract numbers as an array from the cleaned strings
  const matches1 = cleanStr1.match(/-?\d+(\.\d+)?/g);
  const matches2 = cleanStr2.match(/-?\d+(\.\d+)?/g);

  //  Helper function to sum an array of numbers.
  const sum = (numbers) => {
    let total = 0;
    for (const num of numbers) {
      total += num;
    }
    return total;
  };

  // Convert matched strings to numbers and sum them
  const num1 = sum(matches1 ? matches1.map(Number) : []);
  const num2 = sum(matches2 ? matches2.map(Number) : []);

  if (num1 > num2) {
    return 1;
  } else if (num2 > num1) {
    return -1;
  } else {
    return numericalListCompare(rangeA2, rangeB2, "1", "2");
  }
}


/**
 * Filters the numbers in the `GuardiumVersion` array of an item to only include those within the specified range.
 *
 * This function takes an item with a `GuardiumVersion` array, filters the numbers within that array to only include
 * those that fall within the provided lower and upper bounds, and returns the modified item. If no numbers fall within
 * the specified range, the function returns `null`.
 *
 * @param {Object} item - The data item containing the `GuardiumVersion` array to filter.
 * @param {number} lowerBound - The lower bound of the range.
 * @param {number} upperBound - The upper bound of the range.
 * @returns {Object|null} - The item with the filtered `GuardiumVersion` array or `null` if no numbers are within the range.
 *
 * @example
 * // Example 1: Filtering a range of numbers
 * const item = { GuardiumVersion: [1, 5, 8, 12, 15, 20] };
 * const lowerBound = 5;
 * const upperBound = 15;
 * const result = filterNumbersInRange(item, lowerBound, upperBound);
 * // Output: { GuardiumVersion: [5, 8, 12, 15] }
 *
 * @example
 * // Example 2: No numbers within the specified range
 * const item = { GuardiumVersion: [1, 2, 3] };
 * const lowerBound = 5;
 * const upperBound = 10;
 * const result = filterNumbersInRange(item, lowerBound, upperBound);
 * // Output: null
 *
 **/
export function filterNumbersInRange(item, lowerBound, upperBound) {
  const { GuardiumVersion } = item;

  // Filter the GuardiumVersion array to include only numbers within the specified range
  const filteredNumbers = GuardiumVersion.filter(
    (number) => number >= lowerBound && number <= upperBound
  );

  if (filteredNumbers.length === 0) {
    return null; // Return null for the whole row if no numbers match the range
  }

  // Return the item with the filtered GuardiumVersion array
  return {
    ...item,
    GuardiumVersion: filteredNumbers,
  };
}

export function FiltersForTableType1(GVSliderValue, sortedData, selectedOS) {
  const [lowerBound, upperBound] = GVSliderValue;
  // Don't display filtered out Guardium Versions
  sortedData = sortedData
    .map((item) => {
      if (
        !item.hasOwnProperty("GuardiumVersion") ||
        !Array.isArray(item.GuardiumVersion)
      ) {
        console.error("GuardiumVersion is not an array:", item);
        return null;
      }

      return filterNumbersInRange(item, lowerBound, upperBound);
    })
    .filter((item) => item !== null); // Remove null entries

  if (selectedOS != "All") {
    sortedData = sortedData.filter((row) => {
      const osCheck =
        row?.OSName &&
        row.OSName.every((os) => typeof os === "string") &&
        row.OSName.includes(selectedOS);
      return osCheck;
    });
  }

  return sortedData;
}

export function generateOnesListOfLengthN(n) {
  return Array.from({ length: n }, () => 0);
}

export function splitIntoPairs(list) {
  // Ensure the list has an even length by checking if it's odd and appending an empty string if necessary
  const adjustedList =
    list.length % 2 !== 0
      ? [...list, { featureKey: "", featureName: "" }]
      : list;

  // Use Array.from() to generate the pairs
  return Array.from({ length: adjustedList.length / 2 }, (_, i) => [
    adjustedList[i * 2],
    adjustedList[i * 2 + 1],
  ]);
}

// Helper function to do string search
export const fuzzySearchV2 = (term, list, keys, otherOptions) => {
  const options = {
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: term.length * 0.51,
    keys: [...keys],
    ...otherOptions,
  };

  const fuse = new Fuse(list, options);

  let result = fuse.search(term);

  // Option to return the matched text which the caller would need to  highlight the matched text
  const includeMatches = options["includeMatches"];

  if (result.length > 0 && !includeMatches) {
    result = result.map((r) => r.item);
  }

  return result;
};

// Helper function to generate UI
export const generateOrderListItem = (item) => {
  if (item.title && item.content && Array.isArray(item.content)) {
    return (
      <ListItem>
        {item.title}
        <UnorderedList nested>
          {item.content.map((nestedItem) => generateOrderListItem(nestedItem))}
        </UnorderedList>
      </ListItem>
    );
  }

  if (item) {
    return <ListItem>{item}</ListItem>;
  } else {
    return null;
  }
};

// Helper function to generate UI
export const generateAccordianItem = (item) => {
  switch (item.type.toLowerCase()) {
    case "string":
      if (Array.isArray(item.content)) {
        return (
          <div class="generatedAccordionItem">
            <ul>
              {item.content.map((cntnt) => {
                return (
                  <li>
                    {cntnt}
                    <br></br>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      return <div>{item.content}</div>;
    case "orderedlist":
      return (
        <UnorderedList>
          {item.content.map((nestedItem) => generateOrderListItem(nestedItem))}
        </UnorderedList>
      );
    case "unordered":
      return (
        <OrderedList>
          {item.content.map((nestedItem) => generateOrderListItem(nestedItem))}
        </OrderedList>
      );
    case "link":
      return <Link href={item.content.link}>{item.content.title}</Link>;
    default:
      return null;
  }
};
