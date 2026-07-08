# Node.js Fundamentals

## What is Node.js?

Node allows you to run Javascript on your computer or server instead of a browser.

## How does Node.js differ from running JavaScript in the browser?

Because Node is not web based, its not as limited in its reach. Node is able to view/create files, start a web server and work with OS services and more.

## What is the V8 engine, and how does Node use it?

The V8 engine was built for Google Chrome, but Node uses it to run your code.

## What are some key use cases for Node.js?

Web APIs and servers, automated command-line tools ran in the terminal, real-time apps that update instantly, building tools and scripts to bundle code and process files.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**

```js
Uses require to import, uses module.exports to export

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
Uses import to import and export to export
```
