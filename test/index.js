const MailEE = require("../src");
const config = require("../src/utils/conf")(process.argv.slice(2)[0] || "dev");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

(async () => {

	const server = MailEE.createSMTP(config);

	await server.listen();

	console.log("Sending email");

	await server.sendEmail("aurame", "testPassword", {

		from: "Auguste Rame <aurame@privatesuitemag.com>",
		to: "coolcorpstudios@gmail.com",

		subject: "Hello World",
		text: "Hello",
		html: "<b>Hello</b>"

	});

	console.log("Email sent");

})();
