const fs = require("fs");
const path = require("path");

// Write a sample file for demonstration
const sampleFilePath = path.join(__dirname, "sample-files", "sample.txt");
fs.writeFile(sampleFilePath, "Hello, async world!", (err) => {
  if (err) {
    console.log("Error writing file:", err.message);
    return;
  }
});

// 1. Callback style
fs.readFile(sampleFilePath, "utf8", (err, content) => {
  if (err) {
    console.log("Error reading file:", err.message);
    return;
  }
  console.log("Callback read:", content);
});

// Callback hell example (test and leave it in comments):
//callback hell occurs when there are multiple callbacks within other callbacks.
// this causes code to be hard to read and even harder to maintain if something goes wrong.
// what this could look like is...

// function cleanKitchen(){
//     washDishes(function(){
//         cleanCounter(function(){
//             sweepFloor(function(){
//                 mopFloor(function(){
//                     console.log("Kitchen is clean!");
//                 });
//             });
//         });
//     });
// }

// 2. Promise style

function readTextFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, content) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(content);
    });
  });
}

readTextFile(sampleFilePath)
  .then((content) => {
    console.log("Promise read:", content);
  })
  .catch((err) => {
    console.log("Error reading file:", err.message);
  });

// 3. Async/Await style

async function run() {
  try {
    const content = await readTextFile(sampleFilePath);
    console.log("Async/Await read:", content);
  } catch (err) {
    console.log("Error reading file:", err.message);
  }
}

run();
