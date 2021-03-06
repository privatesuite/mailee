const fs = require("fs");
const path = require("path");
const Datastore = require("nedb");
const mailparser = require("mailparser");
const EventEmitter = require("events").EventEmitter;

var db = new Datastore({
	
	filename: path.join(__dirname, "..", "..", "database"),
	autoload: true

});

function randomId () {

	return (Math.random().toString(32).replace("0.", "") + Math.random().toString(32).replace("0.", "")).slice(0, 16);

}

function find (query) {

	return new Promise((resolve, reject) => {

		db.find(query, (err, data) => {

			if (err) reject(err);
			else resolve(data);

		});

	});

}

const events = new EventEmitter();

module.exports = {

	events () {return events;},

	/**
	 * 
	 * @param {string} mailFile 
	 * @param {mailparser.ParsedMail} email 
	 */
	addEmail (mailFile, email) {

		return new Promise((resolve, reject) => {

			db.insert({

				// _id: id,

				type: "email",
				metadata: {

					to: email.to,
					from: email.from,
					cc: email.cc ? email.cc : undefined,
					bcc: email.bcc ? email.bcc : undefined,
					subject: email.subject,
					date: email.date,

					preview: email.text ? email.text.slice(0, 32) : "No text",
					messsageId: email.messageId

				},

				mailFile
	
			}, (err, document) => {
	
				if (err) reject(err);
				else {
				
					events.emit("email", {

						_id: document._id,

						...email,
						mailFile

					});

					resolve();

				}
	
			});
		
		});

	},

	getEmails () {

		return find({

			type: "email"

		});

	},
	
	async getEmail (_id) {

		const email = (await find({

			_id,
			type: "email"

		}))[0];

		if (!email) return;

		const emailData = await mailparser.simpleParser(fs.readFileSync(email.mailFile));

		return {

			...email,
			data: emailData

		}

	},

	async getEmailFromMessageID (id) {

		return (await this.getEmails()).find(_ => _.metadata.messageId === id);

	}

}
