const db = require("../db");
const fs = require("fs");
const path = require("path");
const mailparser = require("mailparser").simpleParser;
const nodemailer = require("nodemailer");
const SMTPServer = require("smtp-server").SMTPServer;
const MailComposer = require("nodemailer/lib/mail-composer");

class SMTP {

	constructor (options) {

		const t = this;

		this.options = options;

		this.users = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", this.options.userfile)));
		this.banned = this.options.banfile ? JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", this.options.banfile))) : [];

		this.server = new SMTPServer({
		
			secure: this.options.secure,

			ca: this.options.caPath ? fs.readFileSync(path.join(__dirname, "..", "..", this.options.caPath)) : undefined,
			key: this.options.keyPath ? fs.readFileSync(path.join(__dirname, "..", "..", this.options.keyPath)) : undefined,
			cert: this.options.keyPath ? fs.readFileSync(path.join(__dirname, "..", "..", this.options.certPath)) : undefined,

			onAuth (auth, session, callback) {

				if (!(session.secure || !this.options.tlsRequired)) {

					t.error(`Non-fatal: Client attempted to connect in violation of "tlsRequired".`);

				}

				const l = t.login(auth.username, auth.password);

				if (l) {

					callback(null, {

						user: l.username

					});

				} else {

					t.error(`Non-fatal: Invalid login information for "${auth.username}".`);
					callback(new Error("Invalid username or password; please try again."));

				}

			},

			onConnect (session, callback) {

				callback();

			},

			onRcptTo (address, session, callback) {

				if (address.endsWith(`@${t.options.host}`)) {

					if (!t.userExists(address.replace(`@${t.options.host}`, ""))) {

						callback(new Error("Non-fatal: Recipient does not exist."));
						return;

					}

				}

				if (!t.isBanned(address.address)) {

					callback(null);

				} else callback(new Error("Non-fatal: Banned recipient."));

			},

			onMailFrom (address, session, callback) {

				if (!t.isBanned(address.address)) {

					callback(null);

				} else callback(new Error("Non-fatal: Banned sender."))

			},

			async onData (stream, session, callback) {

				const email = await mailparser(stream);
				const result = await t.inboundEmail(email, session);

				if (result === true) callback(null);
				else callback(new Error(result || "Non-fatal: Email rejected."));

			}

		});

		this.server.on("error", err => this.error(err));

	}

	listen () {

		return new Promise(resolve => {

			this.server.listen(this.options.port, this.options.host, () => {

				resolve();

			});

		});

	}
	
	error (error) {

		console.log(`MailEE has encountered an error; ${error}`);

	}

	login (username, password) {

		for (const user of this.users) {
			
			if (user.username === username && user.password) {

				if (user.password.type === "plaintext" && user.password.value === password) {

					return user;

				}

			}

		}

		return false;

	}

	userExists (username) {

		return !!this.users.find(_ => _.username === username);

	}

	isBanned (address) {

		return this.banned.indexOf(address) !== -1;

	}
	
	/**
	 * 
	 * @param {string} username Username of sender
	 * @param {string} password Password of sender
	 * @param {nodemailer.Mail.Options} data Mail data
	 */
	async sendEmail (username, password, data) {
		
		let transporter = nodemailer.createTransport({
	
			host: this.options.host,
			port: this.options.port,
			secure: this.options.secure,
			auth: {

				user: username,
				pass: password
	
			}
	
		});
		
		const email = new MailComposer(data);

		await transporter.sendMail(data);

		const original = await mailparser(email.compile().createReadStream());

		db.addEmail(original);

		return original;
		
	}

	inboundEmail (email, session) {

		if (this.isBanned(email.from.value[0])) return "Non-fatal: Banned sender.";

		db.addEmail(email);

		return true;

	}

}

module.exports = SMTP;
