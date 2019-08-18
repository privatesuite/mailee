const log = require("../src/utils/log");
const utils = require("./utils");

utils.run();
log.info("Starting MailEE server...");

process.on("uncaughtException", err => {

	log.error(err.stack);

});

process.on("unhandledRejection", err => {

	log.error(err);

});

process.on("SIGKILL", () => {

	process.exit();

});

// (--- --- START --- ---)

const mailEE = require("../src");

const server = mailEE.createSMTP();

(async () => {

	await server.listen();

	server.sendEmail("aurame", "testPassword", {

		from: "aurame@privatesuitemag.com",
		to: "coolcorpstudios@gmail.com",

		subject: "Hello World",
		text: "Hello",
		html: "<b>Hello</b>"

	});

})();
