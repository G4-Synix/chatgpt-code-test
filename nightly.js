const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const { Client } = require("discord.js");
const dotenv = require("dotenv");
const util = require("util");
const fs = require("fs");

//init dotenv
dotenv.config();

let discord_token = process.env.DISCORD_TOKEN; //Discord Bot Token (env: DISCORD_TOKEN)
let discord_guild = process.env.DISCORD_GUILD_ID; //Discord Guild ID (ID of you discord server) (env: DISCORD_GUILD)
let role_name = process.env.ROLE_NAME; //The name of the role you want to assign
let license_file = process.env.LICENSE_FILE; //The name of the file containing the licenses

//init bot
const bot = new Client();

//check for on ready event
bot.on("ready", () => {
    console.log("The bot is online");
});

bot.on("message", async message => {
    // Check if the message starts with the command prefix
    if (!message.content.startsWith("/check_license")) return;

    // Split the message into parts and get the license number
    const parts = message.content.split(" ");
    const license_number = parts[1];

    // Get the role object by its name
    const role = message.guild.roles.cache.find(r => r.name === role_name);

    // Check if the role exists
    if (!role) {
        message.channel.send(`${role_name} role does not exist on this server`);
        return;
    }

    // Read the text file containing the licenses
    fs.readFile(license_file, "utf8", (err, data) => {
        if (err) {
            message.channel.send(
                `An error occurred while trying to read the licenses file: ${err}`
            );
            return;
        }

        // Split the file into lines
        const lines = data.split("\n");

        // Check if the license number is in the list of licenses
        if (lines.includes(license_number)) {
            // Assign the role to the user
            message.member.roles.add(role);
            message.channel.send(
                `${message.author} has been given the ${role.name} role.`
            );

            // Remove the used license from the text file
            let newLines = lines.filter(line => line !== license_number);
            fs.writeFile(
                license_file,
                newLines.join("\n"),
                (err) => {
                    if (err) {
                        message.channel.send(
                            `An error occurred while trying to remove the license from the file: ${err}`
                        );
                        return;
                    }
                    console.log(`${license_number} was removed from the file.`);
                }
            );
        } else {
            message.channel.send(`Invalid license`);
        }
    });
});

bot.login(discord_token);