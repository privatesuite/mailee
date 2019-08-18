#!/usr/bin/env node

const args = require("minimist")(process.argv.slice(2));
const path = require("path");
const chalk = require("chalk").default;
const utils = require("./utils");
const child_process = require("child_process");

(async () => {

	if (args.disable_reject_unauthorized) {

		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
	}
	
	if (typeof args._[0] === "undefined") {
	
	
	
	} else if (args._[0] === "status") {
	
		if (utils.isRunning()) {
	
			console.info(chalk.green("MailEE is running."));
	
		} else {
		
			console.info(chalk.cyan("MailEE is not currently running."));
		
		}
	
	} else if (args._[0] === "start") {
	
		if (utils.isRunning()) {
	
			console.error(chalk.red("MailEE is already running."));
			
			return;
	
		}

		console.info(chalk.cyan("Starting MailEE..."));
	
		child_process.spawn(process.execPath, [path.join(__dirname, "mailee_run.js")], {

			detached: true,
			stdio: ["ignore", "ignore", "ignore"],
			// stdio: "inherit"
			
		}).unref();

	} else if (args._[0] === "stop") {

		if (!utils.isRunning()) {
	
			console.error(chalk.red("MailEE is not running."));
			
			return;
	
		}

		if (args.force) {

			process.kill(utils.getPID(), "SIGKILL");

		} else process.kill(utils.getPID(), "SIGTERM");
		
		setTimeout(() => {

			if (!utils.isRunning()) console.info(chalk.green("MailEE stopped."));
			else console.error(chalk.red("MailEE failed to stop."));

		}, 7500);

	}

})();
