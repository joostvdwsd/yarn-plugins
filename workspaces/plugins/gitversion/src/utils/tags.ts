import { Locator } from "@yarnpkg/core";

export function tagPrefix(globalTagPrefix: string, locator?: Locator) {
  let result = globalTagPrefix;
  if (locator) {
    if (locator.scope) {
      result += `@${locator.scope}/`
    }
    result += locator.name
    result += '-';
  }
  return result;
}