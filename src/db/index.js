const path = require("path");
const Datastore = require("nedb");

var db = new Datastore({
	
	filename: path.join(__dirname, "..", "..", "database"),
	autoload: true

});

module.exports = {

	addEmail (email) {

		return new Promise((resolve, reject) => {

			db.insert({

				type: "email",
				data: email
	
			}, err => {
	
				if (err) reject(err);
				else resolve();
	
			});
		
		});

	},

	getEmails () {

		return new Promise((resolve, reject) => {

			db.find({

				type: "email"

			}, (err, data) => {

				if (err) reject(err);
				else resolve(data);

			});

		});

	}

}
