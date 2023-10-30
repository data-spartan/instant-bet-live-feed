export async function errorCounter(consErrCount, pattern) {
  let index;
  let found;
  console.log(consErrCount);
  if (consErrCount.length) {
    for (const [index_, item] of consErrCount.entries()) {
      if (item['pattern'] === pattern) {
        index = index_;
        item['count'] += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      index = consErrCount.push({ pattern, count: 1 }) - 1;
    }
  } else {
    index = 0;
    consErrCount.push({ pattern, count: 1 });
  }
  return index;
}
