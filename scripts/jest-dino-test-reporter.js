const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');

const passedFmt = chalk.green;
const failedFmt = chalk.red;
const pendingFmt = chalk.cyan;
const titleFmt = chalk.white;
const headFmt = chalk.white;
const infoFmt = chalk.white;

const iniFmt = chalk.blue;
const logFmt = chalk.bold;
const msgFmt = chalk.gray;

const levelFmt = chalk.white;
const speciesFmt = chalk.yellow;
const wildFmt = chalk.green;
const tamedFmt = chalk.cyan;
const bredFmt = chalk.magenta;

const sep = chalk.red('·');


const DINO_RE = /AssertionError: (.*?) \[(L(?:vl ?)?\d+.*?) at (.*?)\]/;


class JestDinoTestReporter {

   constructor(globalConfig, options) {
      this._globalConfig = globalConfig;
      this._options = options;
   }

   onRunStart({ numTotalTestSuites }) {
      console.log();
      console.log(infoFmt(`Found ${numTotalTestSuites} test suites`));
   }

   onRunComplete(test, results) {
      const {
         numFailedTests,
         numPassedTests,
         numPendingTests,
         testResults,
         numTotalTests,
         startTime
      } = results;

      var failedMessages = testResults.map(({ failureMessage }) => failureMessage).join('\n');
      if (failedMessages) {
         // Remove formatting/colors
         failedMessages = failedMessages.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
         fs.writeFileSync('archive-test-errors.log', failedMessages);
         console.log(`\nDetailed failure log: ${logFmt('archive-test-errors.log')}\n`);
      }

      console.log(infoFmt(`Ran ${numTotalTests} tests in ${testDuration()}`));
      if (numPassedTests) {
         console.log(this._getStatus('passed') + passedFmt(` ${numPassedTests} passing`));
      }
      if (numFailedTests) {
         console.log(this._getStatus('failed') + failedFmt(` ${numFailedTests} failing`));
      }
      if (numPendingTests) {
         console.log(this._getStatus('pending') + pendingFmt(` ${numPendingTests} pending`));
      }

      function testDuration() {
         const delta = moment.duration(moment() - new Date(startTime));
         const seconds = delta.seconds();
         const millis = delta.milliseconds();
         return `${seconds}.${millis} s`;
      }
   }

   onTestResult(test, { testResults }) {
      testResults.map((result) => {
         const { title, duration, status, ancestorTitles } = result;

         if (status === 'failed') {
            const dinoDetailMatch = DINO_RE.exec(result.failureMessages.join('\n'));
            if (dinoDetailMatch) {
               let msg = dinoDetailMatch[1];
               let dinoDetails = dinoDetailMatch[2];
               let iniPath = dinoDetailMatch[3];

               dinoDetails = dinoDetails.replace(/(L(?:vl ?)?\d+) (.*?) (.*)/, (_, lvl, mode, species) => {
                  if (mode === 'tamed') mode = tamedFmt(mode);
                  else if (mode === 'bred') mode = bredFmt(mode);
                  else mode = wildFmt(mode);
                  return `${levelFmt(lvl)} ${mode} ${speciesFmt(species)}`;
               });

               console.log(`    ${this._getStatus(status)} ${iniFmt(iniPath)} ${sep} ${dinoDetails} ${sep} ${msgFmt(msg)}`);
            }
            else {
               const head = `${ancestorTitles.join(' ')}`;
               console.log(`    ${this._getStatus(status)} ${headFmt(head)} ${sep} ${titleFmt(title)}`);
            }
         }
      });
   }

   _getStatus(status) {
      switch (status) {
         case 'passed':
            return passedFmt('✔');
         default:
         case 'failed':
            return failedFmt('✘');
         case 'skipped':
            return pendingFmt('-');
      }
   }
}

module.exports = JestDinoTestReporter;
