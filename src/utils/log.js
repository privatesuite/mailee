const fs = require("fs");
const path = require("path");

const logsFolder = path.join(__dirname, "..", "..", "logs");
const logFilePath = path.join(logsFolder, `.log`);

/**
 * @type {fs.promises.FileHandle}
 */
let handle;
const queue = [];

if (!fs.existsSync(logsFolder)) fs.mkdirSync(logsFolder);

function append (type, data) {

	queue.push({

		type,
		data,
		date: Date.now()

	});

}

async function shift () {

	const data = queue.shift();
	fs.promises.writeFile(handle, `${data.type.toUpperCase()} @ ${data.date.toISOString()} | ${data.data.toString().trim()}\n`);

}

process.stdout.on("data", data => {

	append("info", data);

});

process.stdout.on("error", data => {

	append("error", data);

});

setInterval(async () => {

	if (handle) {

		while (queue.length !== 0) {

			await shift();

		}

		fs.fsyncSync(handle.fd);

	}

}, 100);

// fs.writeFileSync(logFilePath, "");
fs.promises.open(logFilePath, "a+").then(_ => {handle = _});

module.exports = {

	info (data) {

		console.info(data);
		append("info", data);

	},

	error (data) {

		console.error(data);
		append("error", data);

	}

}
