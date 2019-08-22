const SMTP = require("./smtp");
const plugins = require("./plugins");

module.exports = {

	SMTP,

	createSMTP (config) {

		return new SMTP({

			...config.auth,
			...config.smtp

		});

	},

	plugins

}
