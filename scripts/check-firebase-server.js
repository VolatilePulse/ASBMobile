const fs = require('fs');
const chalk = require('chalk');

const CONFIG_FILE = '../.firebaserc';

function requireJSON(filePath) {
   return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

if (!process.argv[2]) {
   console.error(chalk`{yellow Usage:} check-firebase-server.js {cyan <project-name>}`);
   process.exit(1);
}

const targetProject = process.argv[2].trim();

let config = null;
try {
   config = requireJSON(CONFIG_FILE);
}
catch (err) {
   console.error(chalk`{red Error:} Unable to load '{yellow ${CONFIG_FILE}}'. Are you sure you are inside a Firebase project?`);
   process.exit(1);
}

if (!config || !config.projects || !config.projects.default) {
   console.error(chalk`{red Error:} Firebase config invalid.`);
   process.exit(1);
}

if (config.projects.default !== targetProject) {
   console.error(chalk`{red Error:} Firebase is configured for project '{cyan ${config.projects.default}}'. It must be {yellow ${targetProject}}'.`);
   process.exit(1);
}

console.log(chalk`{blue Firebase project check:} {green ${config.projects.default}}`);
console.log();
