const MailEE = require("../src");
const config = require("../src/utils/conf")(process.argv.slice(2)[0] || "dev");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

(async () => {

	const server = MailEE.createSMTP(config);

	await server.listen();

	// MailEE.plugins.load(server);

	console.log("Sending email");

	await server.sendEmail("aurame", "testPassword", {

		from: "aurame@localhost",
		to: "aurame@localhost",

		subject: "Hello World",
		text: "Hello",
		html: "<b>Hello</b><br>".repeat(100)

	});

	console.log("Email sent");

})();
