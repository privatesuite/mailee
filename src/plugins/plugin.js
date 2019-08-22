const fs = require("fs");
const vm2 = require("vm2");
const path = require("path");

const db = require("../db");

class Plugin {

	constructor (smtp, folder) {

		this.vm;
		this.smtp = smtp;
		this.folder = folder;

		this.cache = {};

	}

	package () {

		var t = this;

		function _ () {

			if (fs.existsSync(path.join(t.folder, "package.json"))) {

				return JSON.parse(fs.readFileSync(path.join(t.folder, "package.json")));
	
			} else {
	
				return {
	
					name: path.parse(t.folder).name,
					main: "index.js"
	
				}
	
			}

		}

		return this.cache["package"] || (this.cache["package"] = _());

	}

	start () {

		this.vm = new vm2.NodeVM({
		
			console: "inherit",
			sandbox: {

				process

			},
			require: {

				external: true,
				builtin: ["*"],
				root: this.folder,
				context: "sandbox",
				mock: {

					mailee_plugin: {

						smtp: this.smtp,
						database: db,
						
						utils: {

							log: require("../utils/log"),
							conf: require("../utils/conf")

						},

						constants: {

							basePath: path.join(__dirname, "..", ".."),
							configPath: path.join(__dirname, "..", "..", "config")

						}

					}

				}

			}

		});

		var main = path.join(this.folder, this.package().main);

		this.vm.run(fs.readFileSync(main).toString(), main);

	}

}

module.exports = Plugin;
