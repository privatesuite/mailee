const log = require("../src/utils/log");
const args = require("minimist")(process.argv.slice(2));
const utils = require("./utils");

utils.run();
log.info("Starting MailEE server...");

process.on("uncaughtException", err => {

	log.error(err.stack);

});

process.on("unhandledRejection", err => {

	log.error(err);

});

if (args.ignoreInvalidCertificate) {

	process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

}

// (--- --- START --- ---)

const mailEE = require("../src");
const config = require("./utils/conf")(args.config);
const server = mailEE.createSMTP(config);

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
