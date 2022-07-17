"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagPrefix = void 0;
function tagPrefix(globalTagPrefix, locator) {
    let result = globalTagPrefix;
    if (locator) {
        if (locator.scope) {
            result += `@${locator.scope}/`;
        }
        result += locator.name;
        result += '-';
    }
    return result;
}
exports.tagPrefix = tagPrefix;
