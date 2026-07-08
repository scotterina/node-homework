const os = require("os");
const path = require("path");
const fs = require("fs");

const sampleFilesDir = path.join(__dirname, "sample-files");
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module (system info: platform, cpu, memory)
function OSModuleInfo() {
  console.log("OS Platform:", os.platform());
  console.log("CPU:", os.cpus());
  console.log("Total Memory:", os.totalmem());
}
OSModuleInfo();

// Path module (joins two paths and logs result)
function PathModuleInfo() {
  const joinedPath = path.join(__filename, "sample-files");
  console.log("Joined Path:", joinedPath);
}
PathModuleInfo();

// fs.promises API (writes and reads file sample-files/demo.txt that exists within sample-files folder)
async function fsModuleInfo() {
  const filePath = path.join(__dirname, "sample-files", "demo.txt");
  try {
    await fs.promises.writeFile(filePath, "Hello from fs.promises!");
    const content = await fs.promises.readFile(filePath, "utf8");
    console.log("fs.promises read:", content);
  } catch (err) {
    console.error("Error with fs.promises:", err.message);
  }
}
fsModuleInfo();

// Streams for large files- log first 40 chars of each chunk
