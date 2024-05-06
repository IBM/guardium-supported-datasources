export function isNumber(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
  }
  
export const getRangeStringFromList = (versionList) => {
  
    if (versionList == null) {
        return ''; 
      }
  
  
    versionList.sort((a,b) => {
      return splitStringsCompare(splitStrings(a),splitStrings(b))
    })
    
  
    if (versionList.length === 1) {
        return versionList[0];
      } else if (versionList.length > 1) {
        return `${versionList[0]} - ${versionList[versionList.length - 1]}`;
      }
      return '';
  }
  
export function splitStringsCompare(lstStr1,lstStr2) {

    if (lstStr1.length == 0) {
        if (lstStr2.length == 0) {return 1} else {return -1}
    }

    if (lstStr1[0] == lstStr2[0]){return splitStringsCompare(lstStr1.slice(1),lstStr2.slice(1))}

    if (isNumber(lstStr1[0]) && isNumber(lstStr2[0])) {
        if (Number(lstStr1[0]) >= Number(lstStr2[0])) {
        return 1
        } else {
        return -1
        }
    } else {
        return lstStr1[0].localeCompare(lstStr2[0])
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

export function numericalListCompare(stra1, strb1,stra2,strb2){

// Regular expression to match substrings between parentheses
const regex = /\([^)]*\)/g; 

// Remove substrings between parentheses
const cleanStr1 = stra1.replace(regex, '').trim();
const cleanStr2 = strb1.replace(regex, '').trim();

// Extract numbers from the cleaned strings
const matches1 = cleanStr1.match(/-?\d+(\.\d+)?/g);
const matches2 = cleanStr2.match(/-?\d+(\.\d+)?/g);

const sum = (numbers) => numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

const num1 = sum(matches1 ? matches1.map(Number) : []);
const num2 = sum(matches2 ? matches2.map(Number) : []);



if (num1 > num2) {
return 1
}
else if (num2 > num1) {
return -1
} else {
return numericalListCompare(stra2,strb2,"1","2")
}
}

export function isCompatibleWithRange(lst,rangea,rangeb) {
    
    for (const lstElem of lst) {
      if ((lstElem >= rangea) && (lstElem <= rangeb)) {
        return true

      }
    }
    return false

  }

export function generateOnesList(length) {
    return Array.from({ length }, () => 0);
}

export function splitIntoPairs(list) {
  // Ensure the list has an even length by checking if it's odd and appending an empty string if necessary
  const adjustedList = list.length % 2 !== 0 ? [...list, {featureKey:"",featureName:""}] : list;

  // Use Array.from() to generate the pairs
  return Array.from({ length: adjustedList.length / 2 }, (_, i) => [adjustedList[i * 2], adjustedList[i * 2 + 1]]);
}