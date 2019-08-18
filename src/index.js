const SMTP = require("./smtp");

const config = require("./utils/conf")(process.argv[2] || "dev");

module.exports = {

	SMTP,

	createSMTP () {

		return new SMTP({

			...config.auth,
			...config.smtp

		});

	}

}
