#!/usr/bin/env node

const db = require("../src/db");
const args = require("minimist")(process.argv.slice(2));
const path = require("path");
const chalk = require("chalk").default;
const utils = require("./utils");
const child_process = require("child_process");

// if (!args.config) {

// 	console.error("Please specify a configuration file.");
// 	return;

// }

const confName = args.config || "dev";
const config = require("../src/utils/conf")(confName);

function start () {

	if (utils.isRunning()) {
	
		console.error(chalk.red("MailEE is already running."));
		
		return;

	}

	console.info(chalk.cyan("Starting MailEE..."));

	child_process.spawn(process.execPath, [path.join(__dirname, "mailee_run.js"), "--config", confName], {

		detached: true,
		stdio: ["ignore", "ignore", "ignore"],
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

	} else if (args._[0] === "read") {

		const emails = (await db.getEmails()).sort((a, b) => a.data.date - b.data.date);

		if (args._[1]) {

			const email = emails.find(_ => _._id === args._[1]);

			if (!email) {

				console.error(`Error; Email with identifier "${args._[1]}" not found.`);

			} else {

				console.log(`┌───────────┬─────────────────────`);
				console.log(`│ FROM      │ ${email.data.from.value[0].address}`);
				console.log(`│ TO        │ ${email.data.to.value.slice(0, 100).map(_ => _.address).join(", ")}`);
				console.log(`│ SUBJECT   │ ${email.data.subject}`);
				console.log(`└───────────┴─────────────────────`);
				console.log(``);

				console.log(email.data.text.split("\n").map(_ => `   ${_}`).join("\n"));

			}

			return;

		}

		console.log(`┌`);
		for (const email of emails) {

			console.log(`│ ${email.data.date.toISOString()} │ ${email._id} │ ${email.data.subject.slice(0, 20).padEnd(20, " ")} │ ${email.data.from.value[0].address.slice(0, 20).padEnd(20, " ")} → ${email.data.to.value.slice(0, 3).map(_ => _.address).join(", ")}`);

		}
		console.log(`└`);

	}

})();
