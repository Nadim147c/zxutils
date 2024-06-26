#!/usr/bin/env zx

import "zx/globals"
import { homedir } from "os"
import Help from "../api/help.js"

const argv = minimist(process.argv.slice(3), {
    string: ["new-city", "city"],
    alias: { help: ["h"] },
    boolean: ["help"],
})

if (argv.help) {
    const helper = new Help("Usage: weather [OPTIONS]")
    helper
        .option("--city CITY", "City to fetch weather info.")
        .option("--new-city CITY", "Set a new default city for weather")
        .option("-h, --help", "Prints the help menu")

    helper.print()
    process.exit(0)
}

const weatherData = await spinner("Getting weather information", async () => {
    const locationFile = homedir() + "/.city"

    let location = await $`cat ${locationFile}`.nothrow()

    let locationName
    if (!location.stdout || argv["new-city"]) {
        locationName = argv["new-city"] ? argv["new-city"] : await question("What is your location? ")
        await fs.writeFile(locationFile, locationName, "utf-8")
    } else {
        locationName = location.stdout
    }

    const url = `wttr.in/${argv.city ? argv.city : locationName}?1Fq`

    return $`curl -s ${url}`
})

console.log(weatherData.text())
