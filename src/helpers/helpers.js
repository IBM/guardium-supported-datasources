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

export const getRangeStringFromList = (versionList) => {
  if (versionList == null) {
    return "";
  }

  versionList.sort((a, b) => {
    return splitStringsCompare(splitStrings(a), splitStrings(b));
  });

  if (versionList.length === 1) {
    return versionList[0];
  } else if (versionList.length > 1) {
    return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
  }
  return "";
};

export function splitStringsCompare(lstStr1, lstStr2) {
  if (lstStr1.length == 0) {
    if (lstStr2.length == 0) {
      return 1;
    } else {
      return -1;
    }
  }

  if (lstStr1[0] == lstStr2[0]) {
    return splitStringsCompare(lstStr1.slice(1), lstStr2.slice(1));
  }

  if (isNumber(lstStr1[0]) && isNumber(lstStr2[0])) {
    if (Number(lstStr1[0]) >= Number(lstStr2[0])) {
      return 1;
    } else {
      return -1;
    }
  } else {
    return lstStr1[0].localeCompare(lstStr2[0]);
  }
}

export function splitStrings(str1) {
  // Define the regular expression to match spaces, dots, or hyphens
  const regex = /[ -]+/;

  // Split the strings using the regex
  const list1 = str1.split(regex);

  // Return the arrays of substrings
  return list1;
}

export function numericalListCompare(stra1, strb1, stra2, strb2) {
  // Regular expression to match substrings between parentheses
  const regex = /\([^)]*\)/g;

  // Remove substrings between parentheses
  const cleanStr1 = stra1.replace(regex, "").trim();
  const cleanStr2 = strb1.replace(regex, "").trim();

  // Extract numbers from the cleaned strings
  const matches1 = cleanStr1.match(/-?\d+(\.\d+)?/g);
  const matches2 = cleanStr2.match(/-?\d+(\.\d+)?/g);

  const sum = (numbers) => {
    let total = 0;
    for (const num of numbers) {
      total += num;
    }
    return total;
  };

  const num1 = sum(matches1 ? matches1.map(Number) : []);
  const num2 = sum(matches2 ? matches2.map(Number) : []);

  if (num1 > num2) {
    return 1;
  } else if (num2 > num1) {
    return -1;
  } else {
    return numericalListCompare(stra2, strb2, "1", "2");
  }
}

export function isCompatibleWithRange(lst, rangea, rangeb) {
  for (const lstElem of lst) {
    if (lstElem >= rangea && lstElem <= rangeb) {
      return true;
    }
  }
  return false;
}

// Example usage:
// const numbers = [1, 5, 8, 12, 15, 20];
// const lowerBound = 5;
// const upperBound = 15;
// const result = filterNumbersInRange(numbers, lowerBound, upperBound);
// Output: [5, 8, 12, 15]
export function filterNumbersInRange(item, lowerBound, upperBound) {
  if (
    !Object.prototype.hasOwnProperty.call(item, "GuardiumVersion") ||
    !Array.isArray(item.GuardiumVersion)
  ) {
    console.error("GuardiumVersion is not an array:", item.GuardiumVersion);
    return { ...item, GuardiumVersion: [] };
  }

  const filteredNumbers = item.GuardiumVersion.filter(
    (number) => number >= lowerBound && number <= upperBound
  );

  if (filteredNumbers.length === 0) {
    return null; // Return null for the whole row if no numbers match the range
  }

  return {
    ...item,
    GuardiumVersion: filteredNumbers.length > 0 ? filteredNumbers : [],
  };
}

// export function FiltersForTableType1(GVSliderValue, sortedData, selectedOS) {
export function FiltersForTableType1(GDPVersions, sortedData, selectedOS) {

  sortedData = sortedData.filter((item) => {
    
    let matched = GDPVersions?.some((gv) => item.GuardiumVersion.includes(gv));

    return matched;
  });

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

export function generateOnesList(length) {
  return Array.from({ length }, () => 0);
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
          <div className="generatedAccordionItem">
            <strong>{item.title}</strong>
            <div style={{ fontWeight: "normal" }}>
              <ul>
                {item.content.map((cntnt, index) => (
                  <li key={index}>
                    {cntnt}
                    <br />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
      return (
        <div>
          <strong>{item.title}</strong>
          <div style={{ fontWeight: "normal" }}>{item.content}</div>
        </div>
      );
    case "orderedlist":
      return (
        <div>
          <strong>{item.title}</strong>
          <div style={{ fontWeight: "normal" }}>
            <UnorderedList>
              {item.content.map((nestedItem) =>
                generateOrderListItem(nestedItem)
              )}
            </UnorderedList>
          </div>
        </div>
      );
    case "unordered":
      return (
        <div>
          <strong>{item.title}</strong>
          <div style={{ fontWeight: "normal" }}>
            <OrderedList>
              {item.content.map((nestedItem) =>
                generateOrderListItem(nestedItem)
              )}
            </OrderedList>
          </div>
        </div>
      );
    case "link":
      return (
        <div>
          <strong>{item.title}</strong>
          <div style={{ fontWeight: "normal" }}>
            {item.content.map((link, ind) =>
              link.link && link.title ? (
                <Link key={ind} href={link.link}>
                  {link.title}
                </Link>
              ) : null
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
};
