const SMTP = require("./smtp");

module.exports = {

	SMTP,

	createSMTP (config) {

		return new SMTP({

			...config.auth,
			...config.smtp

		});

	}

}
