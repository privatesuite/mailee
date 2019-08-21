#!/usr/bin/env node

const db = require("../src/db");
const fs = require("fs");
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
const logFile = path.join(__dirname, "..", "logs", ".log");

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
	
		console.log("┌");
		console.log(`│ ${chalk.bold("Help")}`);
		console.log("│");
		console.log("│ status │ Gets the MailEE daemon's current status.");
		console.log("│ start  │ Starts the MailEE daemon.");
		console.log("│ stop   │ Stops the MailEE daemon.");
		console.log("│ reload │ Reloads the MailEE daemon.");
		console.log("│ log    │ Reads the last 15 lines of .log file.");
		console.log("│ read   │ Reads emails. You can specify the email's database ID as the second argument to expand an email.");
		console.log("│ write  │ Writes emails.");

		console.log(`└`);

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

	} else if (args._[0] === "log" || args._[0] === "logs") {

		if (!fs.existsSync(logFile)) {

			console.error(chalk.red("Log file does not exist yet."));
			return;

		}

		let i = 0;
		const logLines = fs.readFileSync(path.join(__dirname, "..", "logs", ".log")).toString().split(/[\r\n]+/).filter(_ => _).map(_ => {

			i++;

			return {

				number: i,
				value: _

			}

		});

		console.log("...");

		for (const line of logLines.slice(logLines.length - 15)) {
			
			console.log(`${line.number}. ${line.value}`)

		}

		console.log(`─── END ───`)

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
				if (email.data.cc) console.log(`│ CC        │ ${email.data.cc.value.slice(0, 100).map(_ => _.address).join(", ")}`);
				console.log(`│ SUBJECT   │ ${email.data.subject}`);
				console.log(`└───────────┴─────────────────────`);
				console.log(``);

				console.log(email.data.text.split("\n").map(_ => `   ${_}`).join("\n"));

			}

			return;

		}

		console.log("┌");
		console.log(`│ ${chalk.bold("Emails")}`);
		console.log(`│`);
		for (const email of emails) {

			console.log(`│ ${email.data.date.toISOString()} │ ${email._id} │ ${email.data.subject.slice(0, 20).padEnd(20, " ")} │ ${email.data.from.value[0].address.slice(0, 20).padEnd(20, " ")} → ${email.data.to.value.slice(0, 3).map(_ => _.address).join(", ")}`);

		}
		console.log(`└`);

	}

})();
