export async function errorCounter(errCount, pattern) {
  let index;
  let found;
  console.log(errCount);
  if (errCount.length) {
    for (const [index_, item] of errCount.entries()) {
      if (item['pattern'] === pattern) {
        index = index_;
        item['count'] += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      //if consErrCount is not empty but entry with that pattern doesnt exists
      index = errCount.push({ pattern, count: 1 }) - 1;
    }
  } else {
    //only when consErrCount is empty(first error ever)
    index = 0;
    errCount.push({ pattern, count: 1 });
  }
  return index;
}
