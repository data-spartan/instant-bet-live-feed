export const joinObjProps = (obj: Object) => {
  return Object.keys(obj)
    .map((key) => `${obj[key]}`)
    .join('-');
};
