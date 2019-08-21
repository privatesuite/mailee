const fs = require("fs");
const path = require("path");
const Plugin = require("./plugin");

var plugins = [];
const plugin_folder = path.join(__dirname, "..", "..", "plugins");

module.exports = {

	getPlugins () {return plugins},

	load () {

		if (!fs.existsSync(plugin_folder)) return [];

		plugins = fs.readdirSync(plugin_folder).map(_ => new Plugin(path.join(plugin_folder, _)));

		for (const plugin of plugins) {

			plugin.start();

		}

		return plugins;

	}

}
