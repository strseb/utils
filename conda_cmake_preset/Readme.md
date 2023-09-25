# Conda Preset Generator

## Why?

This project provides a convenient way to generate CMake preset JSON files for your Conda environments. If you work with Conda to manage your build environments, you may find it useful to export these environments as presets for CMake. This can streamline your development workflow by allowing you to easily switch between different Conda environments when building projects with CMake.

## How to Use

### Prerequisites

Before using this tool, make sure you have the following prerequisites installed:

- [Deno](https://deno.land/): This script is written in TypeScript and runs using Deno.

### Getting Started

1. Either get the file:

   ```bash
   wget https://raw.githubusercontent.com/strseb/utils/main/conda_cmake_preset/conda-preset-generator.ts
   chmod +x conda-preset-generator.ts
   ```
   Or use deno run directly 
   ```
   deno run --allow-env --allow-read=. --allow-run=conda --allow-write=. https://raw.githubusercontent.com/strseb/utils/main/conda_cmake_preset/conda-preset-generator.ts
   
   
   ```

### Generating CMake Presets
1. Activate the Conda environment you want to export. For example:

   ```bash
   conda activate vpn
   ```

2. Run the script with the `name` option to specify the CMake preset name (optional):

   ```bash
   ./conda-preset-generator.ts --name <name>
   ```

   If you omit the `--name` option, the script will use a default name based on your Conda environment's name.

3. The script will generate a CMake preset JSON file in your current working directory. It will also display instructions on how to include the generated JSON file in your CMake configuration.

### Options

- `--name`: Specify the name of the CMake preset.
- `--env`: Specify the name of the Conda environment to export (if not in the base environment).
- `--help`: Display usage information.

## License

This project is licensed under the Mozilla Public License, version 2.0. For more details, please see the [LICENSE](LICENSE) file.

