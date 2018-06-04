#!/usr/bin/env node
'use strict';

import fs from 'fs';
import child_process from 'child_process';
import util from 'util';
import crypto from 'crypto';

import yargs from 'yargs';
import semver from 'semver';
import chalk from 'chalk';
import marked from 'marked';
import inquirer from 'inquirer';
import Enumerable from 'linq';

// Get with the times, Node
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const existsAsync = util.promisify(fs.exists);
const execAsync = util.promisify(child_process.exec);


const NOTE_PLACEHOLDER = "# Placeholder - insert release notes here";
const WHATS_NEW_TMPL_HEAD = `// THIS FILE IS AUTO-GENERATED
// All edits will be lost!

export default \``;
const WHATS_NEW_TMPL_TAIL = `\`;\n`
const WHATS_NEW_FILE = 'src/ui/whatsnew.ts';

/**
 * Split a chunk of text into lines (skipping completely blank lines).
 * @param {string} text
 * @returns {IterableIterator<string>}
 * */
function* splitLines(text) {
   for (var line of text.split(/[\r\n]+/))
      yield line;
}

async function cmd(cmdline) {
   var result = {};
   var failed = false;
   try {
      result = await execAsync(cmdline);
   } catch (ex) {
      result = ex;
      failed = true;
   }

   if (result.stderr && result.stderr.trim())
      failed = true;

   if (options.logOutput || failed) {
      try {
         fs.writeFileSync('release.log', "\n\n> " + cmdline + "\n" + result.stdout, { flag: 'a' });
      } catch (_) {
         console.log(chalk.red('Failed to write release.log'));
      }
   }

   if (failed) {
      try {
         fs.writeFileSync('release.err', "\n\n> " + cmdline + "\n" + result.stderr, { flag: 'a' });
      } catch (_) {
         console.log(chalk.red('Failed to write release.err'));
      }

      error("Failed to execute '" + cmdline + "'\nLogs can be found in release.log and release.err.");
   }

   return result.stdout.trim();
}

async function actionCmd(cmdline) {
   if (options.dryRun) {
      console.log(" >", chalk.grey(cmdline + "  [not run]"));
   } else {
      await cmd(cmdline);
   }
}

function announceStage(text) {
   console.log('\n' + chalk.blueBright.bold(' ⇨ ') + chalk.yellow(text));
}

function logAction(msg) {
   console.log(' *', chalk.green(msg), options.dryRun ? chalk.grey(" [not run]") : '');
}

function log(...values) {
   console.log('  ', ...values);
}

function error(msg) {
   console.error(chalk.red('Error: ') + msg);
   process.exit(1);
}

function abort() {
   console.log('\n' + chalk`{magenta Aborted}`);
   process.exit(0);
}

function noteFileFromVersion(version) {
   return `versions/${version}.md`;
}

function hashString(text) {
   return crypto.createHash('md5').update(text).digest('hex');
}

function markdownToHtml(md) {
   return marked(md, {
      // @ts-ignore
      baseUrl: '/ASBMobile/',
      gfm: true,
      breaks: true,
      smartypants: true,
      tables: true,
      headerIds: false,
   });
}

async function readPackageJson() {
   var content = await readFileAsync('package.json');
   var pkg = JSON.parse(content.toString());
   return pkg;
}

async function writePackageJson(pkg) {
   const content = JSON.stringify(pkg, null, 3) + "\n";
   await writeFileAsync('package.json', content);
}

async function getCurrentGitBranch() {
   return await cmd('git symbolic-ref -q HEAD --short');
}

async function retrieveGitTags() {
   const output = await cmd('git ls-remote --tags ./.');
   const tags = [];
   for (var line of splitLines(output)) {
      if (line.includes('^')) continue;
      const ver = Enumerable.from(line.split('/')).last();
      if (!semver.valid(ver)) continue;
      tags.push(ver);
   }
   return tags;
}

async function retrieveGitStatus() {
   const output = await cmd('git status --porcelain');
   var staged = [], unstaged = [];
   for (var line of splitLines(output)) {
      line = line.trimRight();
      if (!line) continue;
      if (line.substring(0, 1) === 'M') staged.push(line.substring(3));
      if (line.substring(1, 1) === 'M' || line.substring(0, 2).includes('?')) unstaged.push(line.substring(3));
   }
   return [staged, unstaged];
}

const status = {
   branch: '',
   pkg: undefined,

   /** @type {string} */
   branch_version: undefined,

   /** @type {string} */
   package_version: undefined,

   done_package_version: false,

   /** @type {string[]} */
   past_versions: [],
};

const stages = [
   // Startup actions
   //  1) Read version from package.json
   async function startup() {
      announceStage('Reading package.json');

      status.pkg = await readPackageJson();
      status.package_version = status.pkg.version;
      log(chalk`Version {gray from package.json}: {cyan ${status.package_version}}`);
   },

   // Check/create release branch
   //  1) Check current branch, finish if a release branch
   //  2) Confirm go-ahead
   //  3) User picks new version number
   //  4) Use git flow to create branch
   async function branched() {
      announceStage("Release branch creation");

      status.branch = options.branch || await getCurrentGitBranch();
      log(chalk`Current branch: {cyan ${status.branch}}`);

      var [dir, name] = status.branch.split('/');
      if (dir === "release") {
         status.branch_version = name;
         log(chalk`Version {grey from branch}: {cyan ${status.branch_version}}`);
      } else if (status.branch === 'develop') {
         // Are you sure?
         console.log('\nYou are not on a release branch.');
         console.log('To continue we need to begin a release branch.');
         console.log(chalk`Please ensure the {cyan develop} branch is in a state you want to release.`);
         var result = await inquirer.prompt([questions.createReleaseBranch]);
         if (!result.answer) abort();

         // Choose new version?
         const options = [
            semver.inc(status.package_version, 'prerelease'),
            semver.inc(status.package_version, 'patch'),
            semver.inc(status.package_version, 'minor'),
            semver.inc(status.package_version, 'major'),
         ]
         const names = ['Preview ', 'Patch   ', 'Minor   ', 'Major   '];
         const namedOptions = Enumerable.from(options)
            .zip(names, (v, name) => ({ name: name + ": " + v, value: v, short: v })).toArray();
         questions.pickNewVersion.choices = questions.pickNewVersion.choices.concat(namedOptions);
         questions.pickNewVersion.default = semver.inc(status.package_version, 'minor');
         result = await inquirer.prompt([questions.pickNewVersion]);

         // Begin the release process in git-flow
         status.branch_version = result.version;
         logAction("Creating a release branch with git-flow");
         await actionCmd(`git flow release start "${status.branch_version}"`);
      } else {
         error(chalk`Releases should only be created from the {cyan develop} branch.`);
      }
   },

   // Version in package.json
   //  1) Check version, finish if already updated
   //  2) Update version and save
   async function packageVersion() {
      announceStage(chalk`Checking {bold package.json} version`);

      if (status.package_version !== status.branch_version) {
         logAction(chalk`Updating {bold package.json} version`);
         status.pkg.version = status.branch_version;
         status.package_version = status.branch_version;
         if (!options.dryRun)
            await writePackageJson(status.pkg);
      } else {
         log(chalk`Already updated`);
      }
   },

   // New version release note
   //  1) If exists and doesn't contain placeholder, finish
   //  2) If doesn't exist, create placeholder
   //  3) Abort, letting user edit release note
   async function checkCurrentNote() {
      announceStage(chalk`Checking release note for current version`);

      status.current_note_file = noteFileFromVersion(status.branch_version);

      let note = undefined;
      try {
         note = await readFileAsync(status.current_note_file, 'utf8');
      }
      catch (ex) { }

      // Not found or failed to open
      if (note === undefined) {
         logAction("Creating placeholder for new release note");
         if (!options.dryRun)
            await writeFileAsync(status.current_note_file, NOTE_PLACEHOLDER + "\n");
         console.log('\n' + chalk.magenta('Action Required'));
         console.log(chalk`A placeholder release note has created at: {grey ${status.current_note_file}}`);
         console.log(chalk`Edit it and re-run this script when you wish to continue.`);
         process.exit(0);
      }

      if (note.includes(NOTE_PLACEHOLDER)) {
         error("Release note contains placeholder text");
      }

      log("Found");
   },

   // Previous release notes
   //  1) Work out most recent versions
   //  2) Gather notes from file and convert to HTML
   //  3) Generate whatsnew.ts file contents
   //  4) If matches existing content, finish
   //  5) Update whatsnew.ts
   //  6) Abort, instructing user to build & test
   async function collateNotes() {
      announceStage(chalk`Collating recent release notes`);

      status.past_versions = await retrieveGitTags();
      status.past_versions = status.past_versions.map(v => v.replace(/-preview(\d)/, '-preview.$1')); // handle bad preview tags
      status.past_versions.push(status.package_version);
      status.past_versions.sort((a, b) => -semver.compare(a, b));
      let versions_list = Enumerable.from(status.past_versions).take(options.numNotes).toArray().join(', ');
      if (status.past_versions.length > options.numNotes) versions_list += '...';
      log(chalk`Past versions: {cyan ${versions_list}}`);

      // Gather notes from files and convert to HTML
      const notes = [];
      for (const version of status.past_versions) {
         let note = '';
         try {
            note = await readFileAsync(noteFileFromVersion(version), 'utf8');
         }
         catch (e) { }

         notes.push(`<div><header>${version}</header><section>${markdownToHtml(note)}</section></div>`);
      }

      // Generate file contents
      const newContents = WHATS_NEW_TMPL_HEAD + notes.join('\n') + WHATS_NEW_TMPL_TAIL;

      // Check if existing file matches
      let existingContents = '';
      try {
         existingContents = await readFileAsync(WHATS_NEW_FILE, 'utf8');
      }
      catch (e) { }

      if (hashString(newContents) === hashString(existingContents)) {
         log('No changes required');
      } else {
         logAction(chalk`Writing release notes written to {grey ${WHATS_NEW_FILE}}`);
         if (!options.dryRun)
            await writeFileAsync(WHATS_NEW_FILE, newContents);

         console.log('\n' + chalk.magenta('Action Required'));
         console.log(chalk`The {cyan What's New} page has been updated.`);
         console.log(chalk`Build and test, then re-run this script to continue.`);
         console.log(chalk`Make sure to to a production build!`);
         process.exit(0);
      }
   },

   // Commit staged changes
   //  1) If anything unstaged, abort
   //  2) If nothing staged, finish
   //  3) Confirm go ahead
   //  4) Commit changes
   async function commitChanges() {
      announceStage(chalk`Preparing to commit`);

      // Check nothing is unstaged
      const [staged, unstaged] = await retrieveGitStatus();
      if (unstaged.length) {
         console.log('\n' + chalk.magenta('Action Required'));
         console.log(chalk`You have unstaged changes in your working directory.`);
         console.log(chalk`Once you have built and tested, stage the relevant changes then re-run this script to continue.`);
         process.exit(0);
      }
      log("No unstaged changes");

      if (staged.length === 0) {
         log("No outstanding staged changes");
      } else {
         log("Outstanding staged changes");

         // Confirm continue
         var result = await inquirer.prompt([questions.confirmCommit]);
         if (!result.answer) abort();

         logAction('Committing staged changes');
         await actionCmd(`git commit -m "Prepare release ${status.package_version}"`);
      }
   },

   // Complete release with git-flow
   //  1) Confirm go ahead
   //  2) finish the release
   //  3) Push the tag
   async function finishRelease() {
      announceStage(chalk`Completing release`);

      var result = await inquirer.prompt([questions.confirmFinish]);
      if (!result.answer) abort();

      logAction('Using git-flow to complete the release');
      await actionCmd(`git flow release finish "${status.package_version}" -p -f "${status.current_note_file}"`);
      logAction('Pushing release tag to origin');
      await actionCmd(`git push origin "${status.package_version}"`);

      console.log(chalk`\n{magenta Release completed!}`);
   },
];

const questions = {
   createReleaseBranch: {
      type: 'confirm',
      name: 'answer',
      message: 'Do you wish to create the release branch?',
      default: false,
   },

   pickNewVersion: {
      type: 'list',
      name: 'version',
      message: 'Choose the new version number to use:',
      choices: [], // ['Custom'],
   },

   confirmCommit: {
      type: 'confirm',
      name: 'answer',
      message: 'There are outstanding staged files. Are you ready to commit them?',
      default: false,
   },

   confirmFinish: {
      type: 'confirm',
      name: 'answer',
      message: 'Are you ready to make this version live?',
      default: false,
   },
};


function argIsNotNaN(field) {
   return args => !Number.isNaN(args[field]) || "Not a number: " + field;
}

const options = yargs
   .version('0.1')
   .help()
   .strict()
   .option('n', {
      alias: 'num-notes',
      type: 'number',
      default: 3,
      requiresArg: true,
      description: "Number of release notes to include in What's New"
   })
   .option('d', {
      alias: 'dry-run',
      type: 'boolean',
      description: 'Dry run - do not change anything'
   })
   .option('l', {
      alias: 'log-output',
      type: 'boolean',
      description: 'Log output of commands to release.log'
   })
   .option('b', {
      alias: 'branch',
      type: 'string',
      requiresArg: true,
      description: "DEV: Pretend we're on the specified branch"
   })
   .check(argIsNotNaN('num-notes'))
   .check(args => (args._.length > 0) ? "Too many arguments" : true)
   .argv;


async function main() {
   // options.dryRun = true;

   if (options.dryRun)
      console.log(chalk`{gray [--dry-run mode active]}`);

   console.log('\n' + chalk`{cyanBright Release process:} Checking what stage we're at...`);

   for (const stage of stages) {
      await stage();
   }
}


main();
