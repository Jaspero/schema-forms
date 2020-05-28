/**
 * Remove all characters that are not alphanumeric.
 *
 * In case of not finding any alphanumeric characters
 * return string `file-{random number}`
 *
 * @param name
 * File name to format
 */
export const formatFileName = (name: string): string => {
  const extension = name.slice(name.lastIndexOf('.'));
  name = name.slice(0, name.lastIndexOf('.'));
  name = (name.match(/[a-zA-Z\d.]/g) || []).join('');
  return !!name.length ? name + extension : `file-${Math.floor(Math.random() * 10 ** 5) + 1}${extension}`;
};
