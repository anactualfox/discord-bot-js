var { SlashCommandBuilder } = require("@discordjs/builders");
var imgur = require("../helpers/imgur/imgur-api");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("imgur")
		.setDescription("Fetches image(s) from subreddit galleries")
		.addStringOption((option) =>
			option
				.setName("subreddit")
				.setDescription("Which Subreddit?")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("sorting")
				.setDescription("Sort by?")
				.addChoice("Time", "time")
				.addChoice("Top", "top")
		)
		.addStringOption((option) =>
			option
				.setName("time")
				.setDescription("Time Range?")
				.addChoice("day", "day")
				.addChoice("week", "week")
				.addChoice("month", "month")
				.addChoice("year", "year")
				.addChoice("all", "all")
		)
		.addIntegerOption((option) =>
			option.setName("images").setDescription("Enter a number")
		)
		.addIntegerOption((option) =>
			option.setName("page").setDescription("Enter a number")
		),

	async execute(interaction) {
		//get user's selections
		const subreddit = interaction.options.getString("subreddit");
		var sorting = interaction.options.getString("sorting");
		var time = interaction.options.getString("time");
		var page = interaction.options.getInteger("page");
		var numberOfImages = interaction.options.getInteger("images");

		//sorting out default settings
		sorting = !sorting ? "time" : sorting;
		time = !time ? "week" : time;
		page = !page ? "0" : page;
		numberOfImages = !numberOfImages ? "1" : numberOfImages;
		/*
		Limitations:
			We can't have a short time range and sort by top, top doesn't exist for a short time range
			Therefore if our time range is week or day, and our sorting is top, we change the time range to year
		*/
		time =
			(time == "day" || time == "week") && sorting == "top" ? "year" : time;

		try {
			let res = await imgur.findImages(
				subreddit,
				sorting,
				time,
				page,
				numberOfImages
			);

			var message = "";
			//loop through response, find append image link to message string
			res.forEach((image) => (message += `${image.link}\n`));

			await interaction.reply(`${message}`);
		} catch (err) {
			await interaction.reply("There was some kind of error. :c");
		}
	},
};
