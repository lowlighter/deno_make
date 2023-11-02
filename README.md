# 🍳🦕 deno make

_deno make_ integrates seemlessly within your `deno.jsonc` configuration file to provide an extended set of features to
the [deno](https://deno.land) task runner.

You can assign default permissions and flags to deno subcommands, environment variables, assign descriptions and more.

## 💭 Why ?

While the default [deno task runner](https://docs.deno.com/runtime/manual/tools/task_runner) is great, it is not always
suitable for long scripts as it's not possible to split them into multiple lines, and passing flags to deno subcommands
is often tedious.

_deno make_ solves these issues by computing dynamically deno commands flags before calling the default deno task
runner, in addition to providing a few extra features.

## 📚 Usage

### 1. Register _deno make_ in `deno.jsonc`

```jsonc
// deno.jsonc
{
  "tasks": {
    "make": "deno run --allow-env --allow-read --allow-write=.deno-make.json --allow-run=deno https://deno.land/x/make/mod.ts $0"
  }
}
```

### 2. Configure `"deno-make"` tasks in `deno.jsonc`

```jsonc
// deno.jsonc
{
  "+tasks": {
    "start": {
      "description": "🍱 Start application",
      "task": "deno run mod.ts",
      "deno": {
        "run": { // For "deno run" subcommand
          "unstable": true, // ➡️ --unstable
          "permissions": {
            "prompt": false, // ➡️ --no-prompt
            "read": true, // ➡️ --allow-read
            "run": false, // ➡️ --deny-run
            "net": [ // ➡️ --allow-net=https://deno.land,https://example.com
              "https://deno.land",
              "https://example.com"
            ],
            "write": { // ➡️ --allow-write=/tmp --deny-write=/root
              "allow": [
                "/tmp"
              ],
              "deny": [
                "/root"
              ]
            }
          }
        }
      },
      // Configure environment variables
      "env": {
        "FOO": true, // ➡️ Inherit FOO environment variable
        "BAR": "bar" // ➡️ Set BAR environment variable to "bar"
      }
    },
    // Write "multi-line" tasks using arrays (they will be joined with "\n")
    "test": {
      "description": "🧪 Run tests and print collected coverage",
      "task": [
        "rm -rf .coverage &&",
        "deno test &&",
        "deno coverage .coverage"
      ],
      "deno": {
        "test": { // For "deno test" subcommand
          "unstable": true, // ➡️ --unstable
          "permissions": { // ➡️ --allow-all
            "all": true
          },
          "coverage": ".coverage", // ➡️ --coverage=.coverage
          "parallel": true // ➡️ --parallel
        },
        "coverage": { // For "deno coverage" subcommand
          "quiet": true // ➡️ --quiet
        }
      }
    }
  }
}
```

### 3. Run tasks with `deno task make` instead

```bash
deno task make run
```

#### Print all available _deno make_ tasks

```bash
deno task make
```
