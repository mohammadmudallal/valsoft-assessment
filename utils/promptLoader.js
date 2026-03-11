const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function renderTemplate(template, variables = {}) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = variables[key];

    if (value === undefined || value === null) return "";

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return value;
  });
}

function loadPrompt(promptName, variables = {}) {
  const filePath = path.join(__dirname, "..", "prompts", `${promptName}.yaml`);

  const file = fs.readFileSync(filePath, "utf8");
  const prompt = yaml.load(file);

  const systemPrompt = prompt.system;

  const userPrompt =
    prompt.instructions +
    "\n\nReturn JSON in this format:\n" +
    prompt.output_schema +
    "\n\n" +
    renderTemplate(prompt.user_template, variables);

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

module.exports = {
  loadPrompt,
};