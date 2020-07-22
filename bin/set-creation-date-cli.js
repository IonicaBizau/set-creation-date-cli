#!/usr/bin/env node
"use strict";

const Tilda = require("tilda")
    , util = require("util")
    , glob = util.promisify(require("glob"))
    , Utimes = require('@ronomon/utimes')
    , changeUtimes = util.promisify(Utimes.utimes)
    , fs = require("fs").promises
    ;

new Tilda(`${__dirname}/../package.json`, {
    options: [
        {
            name: "verbose"
          , opts: ["V", "verbose"]
          , desc: "Enable verbose mode."
          , type: Boolean
        },
        {
            name: "extensions"
          , opts: ["e", "extensions"]
          , desc: "List the unique extensions of the files."
          , type: Boolean
        }
    ]
  , args: [{
        name: "match"
      , type: String
      , desc: "The file match pattern."
    }]
}).main(async action => {

    // Query the files
    const files = await glob(action.args.match)

    if (action.options.extensions.value) {
        const uniqueExts = files.reduce((acc, c) => {
            if (c.includes(".")) {
                acc[c.split(".").slice(-1)[0]] = 1
            }
            return acc
        }, {})
        console.log(Object.keys(uniqueExts))
        return
    }

    for (let i = 0; i < files.length; ++i) {
        const cFile = files[i]
        const stat = await fs.stat(cFile)
        debugger
        if (action.options.verbose.value) {
            console.log(`Updating ${cFile}`, stat)
        }
        await changeUtimes(
            cFile
          , +stat.mtime
          , +stat.mtime
          , +stat.mtime
        )
    }
});
