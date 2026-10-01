# Node.js Fundamentals

## What is Node.js?

node gives javascript the ability to run on your computer instead of the browser

## How does Node.js differ from running JavaScript in the browser?

its able to read and write files since its not limited in web only spaces

## What is the V8 engine, and how does Node use it?

an engine reads and converts javascript into instructions that a computer can run. node uses it to bridge the gap between browser and computer side coding and capabilities

## What are some key use cases for Node.js?

web APIs and servers, command line tools, real time apps, tools and scripts that bundle or process files

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**

```js
// Uses require to import, uses module.exports to export

ex 1.
const { register, logoff } = require("../controllers/userController");

ex 2.
function add(a, b) {
  return a + b;
}
function multiply(a, b) {
  return a * b;
}
module.exports = { add, multiply };
```

**ES Modules (supported in modern Node.js):**

```js
// Uses import to import and export to export
```
