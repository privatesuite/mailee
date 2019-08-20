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

const MailEE = require("../src");
const config = require("../src/utils/conf")(args.config);
const server = MailEE.createSMTP(config);

(async () => {

	await server.listen();

	log.info("Server is listening.");

})();
