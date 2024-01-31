const path = require(`path`);

exports.onCreateWebpackConfig = ({ actions }) => {
	actions.setWebpackConfig({
		resolve: {
			alias: {
				"@/components": path.resolve(__dirname, "src/components"),
				"@/lib/utils": path.resolve(__dirname, "src/lib/utils"),
			},
		},
	});
};
