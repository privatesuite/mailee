const utils = require("./utils");

utils.run();

process.on("SIGKILL", () => {

	process.exit();

});

// (--- --- START --- ---)

const mailEE = require("../src");

const server = mailEE.createSMTP();


