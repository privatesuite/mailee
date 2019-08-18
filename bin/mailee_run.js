const utils = require("./utils");

utils.run();

process.on("SIGKILL", () => {

	process.exit();

});

// (--- --- START --- ---)

const mailEE = require("../src");

const server = mailEE.createSMTP();

(async () => {

	server.sendEmail("aurame", "testPassword", {

		from: "aurame@localhost",
		to: "auguste.rame@gmail.com",

		subject: "Hello World",
		text: "Hello",
		html: "<b>Hello</b>"

	});

})();
