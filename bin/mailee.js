#!/usr/bin/env node

const args = require("minimist")(process.argv.slice(2));
const path = require("path");
const chalk = require("chalk").default;
const utils = require("./utils");
const child_process = require("child_process");

if (!args.config) {

	console.error("Please specify a configuration file.");
	return;

}

const config = require("../src/utils/conf")(args.config);

function start () {

	if (utils.isRunning()) {
	
		console.error(chalk.red("MailEE is already running."));
		
		return;

	}

	console.info(chalk.cyan("Starting MailEE..."));

	child_process.spawn(process.execPath, [path.join(__dirname, "mailee_run.js")], {

		detached: true,
		stdio: ["ignore", process.stdout, process.stderr],
		// stdio: "inherit"
		
	}).unref();

}

function stop () {

	return new Promise((resolve, reject) => {

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

			resolve();
			
		}, 7500);

	});

}

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
	
		await start();

	} else if (args._[0] === "stop") {

		await stop();

	} else if (args._[0] === "reload" || args._[0] === "restart") {

		await stop();
		await start();

	} else if (args._[0] === "read" && args._[1]) {



	}

})();
