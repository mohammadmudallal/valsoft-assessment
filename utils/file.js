const fs = require("fs");
const path = require("path");

function readJson(relativePath) {
  const filePath = path.join(__dirname, "..", relativePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJson(relativePath, data) {
  const filePath = path.join(__dirname, "..", relativePath);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function appendJson(relativePath, data) {
  const filePath = path.join(__dirname, "..", relativePath);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let existing = [];

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");

    if (raw.trim().length > 0) {
      existing = JSON.parse(raw);
    }
  }

  if (!Array.isArray(existing)) {
    throw new Error("Existing JSON file must contain an array.");
  }

  if (Array.isArray(data)) {
    existing.push(...data);
  } else {
    existing.push(data);
  }

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8");
}

module.exports = {
  readJson,
  writeJson,
  appendJson,
};