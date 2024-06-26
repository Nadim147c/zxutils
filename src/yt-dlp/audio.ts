#!/usr/bin/env zx

import os from "os"
import "zx/globals"
import Help from "../api/help.js"

const argv = minimist(process.argv.slice(3), {
    alias: { help: ["h"] },
    boolean: ["help", "sponsorblock", "debug", "yt-music"],
})

if (argv.help) {
    const helper = new Help("Usage: video [OPTIONS] URL")
    helper.argument("URL", "url of the video to download")
    helper
        .option("--section REGEX", "Section of the video to download. Timestamp must start with * (ex: '*0.11-0.50')")
        .option("-c, --cookies FILE", "Netscape formatted file to read cookies from and dump cookie jar in")
        .option("--browser BROWSER", "Name of the browser to use cookies from")
        .option("--threads NUMBER", "Number of concurrent downloads. Default is 1")
        .option("--no-sponsorblock", "Disable sponsorblock for downloaded video. Default is on")
        .option("-h, --help", "Prints the help menu")
        .option("--debug", "Prints the debug info")

    echo($({ input: helper.toString(), sync: true })`cm`)
    process.exit(0)
}

if (typeof argv.sponsorblock === "undefined") argv.sponsorblock = true
if (typeof argv.threads === "undefined") argv.threads = 1
if (typeof argv.ext === "undefined") argv.ext = "mp3"

if (argv.debug) console.log(argv)

const outputTemplate = `${os.homedir()}/Downloads/Audio/%(title)s-%(id)s.%(ext)s`

const format = "beataudio/best"

const ytDlpArgs = [
    "--extract-audio",
    "--no-playlist",
    "--audio-quality=0",
    `--format=${format}`,
    `--concurrent-fragments=${argv.threads}`,
    `--output=${outputTemplate}`,
    "--add-metadata",
    "--embed-chapters",
    "--list-formats",
    "--no-simulate",
    "--color=always",
]

if (argv.sponsorblock) ytDlpArgs.push("--sponsorblock-remove", "all")
if (argv.section) ytDlpArgs.push("--download-sections", argv.section)
if (argv.cookies) ytDlpArgs.push("--cookies", argv.cookies)
if (argv.browser) ytDlpArgs.push("--cookies-from-browser", argv.browser)

let url = argv.url ?? argv._[0]
if (!url) {
    console.log(chalk.red("Please provide a url or search term"))
    process.exit(1)
}

try {
    url = new URL(url)
} catch (err) {
    url = `ytsearch:${url}`
}

await $`yt-dlp ${ytDlpArgs} ${url}`.verbose(true)
