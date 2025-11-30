/**
 * Custom ESLint rules for the homepage project
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const buttonCursorPointer = require("./button-cursor-pointer");

module.exports = {
  rules: {
    "button-cursor-pointer": buttonCursorPointer,
  },
};
