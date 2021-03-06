const faceit = require("../api/faceit/faceit-api");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
var fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("graph")
		.setDescription("Last 2000 Matches Graphed From FACEIT")
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("Enter a faceit username")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("linecolor").setDescription("Line Color (Hex)")
		)
		.addStringOption((option) =>
			option
				.setName("graphcolor")
				.setDescription("Graph Background Color (Hex)")
		),

	async execute(interaction) {
		await interaction.deferReply();
		const username = interaction.options.getString("username");
		const linecolor = interaction.options.getString("linecolor");
		const graphcolor = interaction.options.getString("graphcolor");

		try {
			let res = await faceit.getMatchHistory(username);

			const elo_history = res.data
				.map((match) => match.elo)
				.filter((elo) => elo !== undefined)
				.reverse();
			const count = elo_history.map((elo, index) => {
				return (index + 1).toString();
			});
			//Chart default settings
			const width = 700; //px
			const height = 500; //px

			const backgroundColour = !graphcolor ? "#dadada" : graphcolor;
			const borderColor = !linecolor ? "rgb(75, 192, 192)" : linecolor;

			const chartJSNodeCanvas = new ChartJSNodeCanvas({
				width,
				height,
				backgroundColour,
			});
			//Chart data
			const data = {
				labels: count,
				datasets: [
					{
						label: username,
						data: elo_history,

						pointRadius: 0,
						fill: false,
						borderColor: borderColor,
						tension: 0.3,
					},
				],
			};
			//Chart config
			const configuration = {
				type: "line",
				data: data,
				options: {
					scales: {
						x: {
							ticks: {
								font: {
									size: 20,
									weight: "bold",
									color: "#FFFFFF",
								},
							},
						},
						y: {
							ticks: {
								font: {
									size: 20,
									weight: "bold",
									color: "#FFFFFF",
								},
							},
						},
					},
					plugins: {
						legend: {
							labels: {
								//display:false,
								font: {
									size: 25,
									weight: "bold",
									color: "#FFFFFF",
								},
							},
						},
					},
					layout: { padding: 30 },
				},
				plugins: [],
			};
			//Save chart to local folder
			const image = await chartJSNodeCanvas.renderToBuffer(configuration);
			const attachment = new AttachmentBuilder(image, { name: `graph.png` });

			const embed = new EmbedBuilder()
				.setColor("#ff5500")
				.setImage(`attachment://graph.png`)
				.setAuthor({
					name: `${username}'s elo graph`,
					iconURL:
						"https://corporate.faceit.com/wp-content/themes/app-theme/assets/o/images/ico/ms-tile-image.png",
					url: `https://www.faceit.com/en/players/${username}`,
				});

			await interaction.editReply({ embeds: [embed], files: [attachment] });
		} catch (err) {
			await interaction.editReply("Player not found?");
		}
	},
};
