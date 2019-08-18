const fs = require("fs");
const path = require("path");
const lockfile = require("proper-lockfile");

const PID_PATH = path.join(__dirname, "..", "mailee.pid");

function create (_) {

	fs.writeFileSync(_, process.pid + "\n");

}

function remove (_) {

	fs.unlinkSync(_);

}

module.exports = {

	run () {

		create(PID_PATH);
		lockfile.lockSync(PID_PATH);

	},

	getPID () {

		if (this.isRunning()) return parseInt(fs.readFileSync(PID_PATH).toString());

	},

	stop () {

		if (this.isRunning()) {

			lockfile.unlockSync(PID_PATH);
			remove(PID_PATH);

		}

	},

	isRunning () {

		return fs.existsSync(PID_PATH) && lockfile.checkSync(PID_PATH, {

			stale: 5000
			
		});

	}

}
