function thousandSeparator(num: number | string): string {
  let numStr = num.toString();
  let result = "";
  let count = 0;

  // Process the part after the decimal point, if it exists
  let decimalPart = "";
  if (numStr.includes(".")) {
    let parts = numStr.split(".");
    numStr = parts[0];
    decimalPart = "." + parts[1];
  }

  // Add commas every three digits from the right
  for (let i = numStr.length - 1; i >= 0; i--) {
    result = numStr.charAt(i) + result;
    count++;
    if (count === 3 && i !== 0) {
      result = "," + result;
      count = 0;
    }
  }

  return result + decimalPart;
}

export default thousandSeparator;
