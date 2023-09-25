#!/usr/bin/env -S deno run --allow-env --allow-read=. --allow-run=conda --allow-write=.

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { parse } from "https://deno.land/std@0.202.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.202.0/path/mod.ts";
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const currentWorkingDirectory = Deno.cwd();

const log = console.log;
function run(command: string, args: Array<string>) {
  const info = new Deno.Command(command, { args }).outputSync();
  const bytes = info.stdout;
  return new TextDecoder().decode(bytes);
}
const preset_template = {
  "version": 6,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 23,
    "patch": 0,
  },
  "include": [],
  "configurePresets": [],
  "buildPresets": [],
  "testPresets": [],
  "vendor": {},
};

const cliArgs = parse(Deno.args, {
  string: ["name", "env"],
  boolean: ["help"],
  default: {
    name: "",
    env: "",
    help: false,
  },
});
let { name, help, env } = cliArgs;

if (help) {
  log(chalk.green("Conda Preset Generator \n"));
  log(
    "\t Can generate a UserPresets.json File for your current Conda Env, to use outside of terminals \n",
  );
  log("\t Usage; \n");
  log("\t \t $: conda activate MY_Enviroment_To_export \n");
  log(
    "\t \t $: npm run conda_preset_generator --name <cmake_preset_name>  \n",
  );
  Deno.exit();
}

let env_info;
try {
  const info = run("conda", ["info", "--json"]);
  env_info = JSON.parse(info);
} catch (error) {
  log(chalk.red("Failed to get info about your conda enviroment: \n"));
  log(chalk.red(error.toString()));
  Deno.exit();
}

if (env_info["active_prefix_name"] == "base") {
  if (env === "") {
    log(
      chalk.red(
        "You are in your base env, please `conda activate ` the env you want to export! \n",
      ),
    );
    log(chalk.red("Or Provide the env to export with --env <name> \n"));
    Deno.exit();
  }
  const args = [
    "run",
    "--name",
    env,
    "node",
    path.resolve(__dirname, "index.js"),
  ];
  if (name !== "") {
    args.push("--name"), args.push(name);
  }
  console.log("Running: " + args.join(" "));
  run("conda", args);
  Deno.exit();
}
if (name === "") {
  name = "conda_" + env_info["active_prefix_name"];
}

log(
  chalk.green(
    `Exporting Conda Env "${
      env_info["active_prefix_name"]
    }" as cmake preset "${name}" \n`,
  ),
);

const configure_preset = {
  "name": name,
  "displayName": name,
  "description": `Exported Conda Env: ${env_info["active_prefix_name"]}`,
  "generator": "Ninja",
  "binaryDir": "${sourceDir}/build/" + name,
  "cacheVariables": {},
  "environment": Deno.env.toObject(),
  "vendor": {},
};
const build_preset = {
  "name": name,
  "configurePreset": name,
};

const preset = structuredClone(preset_template);
preset.configurePresets.push(configure_preset);
preset.buildPresets.push(build_preset);

const outputPath = path.resolve(currentWorkingDirectory, `${name}Preset.json`);
Deno.writeTextFileSync(outputPath, JSON.stringify(preset, null, 2));

log(chalk.green(`Wrote New Preset to ${outputPath}`));
log(`
    In your CMakeUserPresets.json add it using:
    { 
        <...>
        "include": [
            "CMakeConda${name}Presets.json",
            ...
        ],
        <...>
    }
`);
