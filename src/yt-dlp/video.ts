#!/usr/bin/env zx

import os from "os"
import "zx/globals"
import Help from "../api/help.js"

const exit = process.exit

const argv = minimist(process.argv.slice(3), {
    alias: { help: ["h"], resolution: ["r"] },
    boolean: ["help", "sponsorblock", "debug"],
})

if (argv.help) {
    const helper = new Help("Usage: video [OPTIONS] URL")
    helper.argument("URL", "url of the video to download")
    helper
        .option("--section REGEX", "Section of the video to download. Timestamp must start with * (ex: '*0.11-0.50')")
        .option("-c, --cookies FILE", "Netscape formatted file to read cookies from and dump cookie jar in")
        .option("--browser BROWSER", "Name of the browser to use cookies from")
        .option("--ext FORMAT", "Containers that may be used when merging format")
        .option("-r, --resolution", "Resolution to download video. Use max for maximum resolution")
        .option("--threads NUMBER", "Number of concurrent downloads. Default is 1")
        .option("--no-sponsorblock", "Disable sponsorblock for downloaded video. Default is on")
        .option("-h, --help", "Prints the help menu")
        .option("--debug", "Prints the debug info")

    helper.print()
    exit(0)
}

if (typeof argv.sponsorblock === "undefined") argv.sponsorblock = true
if (typeof argv.threads === "undefined") argv.threads = 1
if (typeof argv.ext === "undefined") argv.ext = "mp4"

if (argv.debug) console.log(argv)

const outputTemplate = `${os.homedir()}/Downloads/Video/%(title)s-%(id)s.%(ext)s`

let format
if (!argv.resolution) {
    format = "bv[height<=1080]+ba/b[height<=1080]"
} else if (typeof argv.resolution === "number") {
    format = `bv[height<=${argv.resolution}]+ba/b[height<=${argv.resolution}]`
} else {
    format = "bv+ba/b"
}

const ytDlpArgs = [
    "--format",
    format,
    "--merge-output-format",
    argv.ext,
    "--concurrent-fragments",
    argv.threads,
    "--output",
    outputTemplate,
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
    exit(0)
}

try {
    url = new URL(url)
} catch (err) {
    url = `ytsearch:${url}`
}

await $`yt-dlp ${ytDlpArgs} ${url}`.verbose(true)
