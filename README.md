# 🍳🦕 deno make

_deno make_ integrates seemlessly with your existing `deno.jsonc` configuration file to provide an extended set of
features to the [deno](https://deno.land) task runner.

## 🚀 Features

- Seamless integration with your existing `deno.jsonc` configuration file
- Set flags per deno subcommands in a descriptive way
- Set or inherit environment variables
- Write long tasks using arrays to improve readability
- Add descriptions to your tasks
- List and preview available tasks

![Advanced task configuration](/demo/config.png)

![List available tasks](/demo/list.png)

Learn more about the syntax in [`demo/deno.jsonc`](/demo/deno.jsonc) !

### 💭 But why ?

The default [deno task runner](https://docs.deno.com/runtime/manual/tools/task_runner) is great, but long tasks can
quickly become hard to read and maintain. This small script aims to solve this issue by providing a few extra features
for convenience.

## 📚 Usage

### 1️⃣ Register _deno make_ in `deno.jsonc`

```jsonc
// deno.jsonc
{
  "tasks": {
    // 🔧 Alias deno_make to `deno task make` to make it easier
    "make": "deno run --allow-env --allow-read --allow-write=.deno-make.json --allow-run=deno https://deno.land/x/make/mod.ts $0"
  }
}
```

### 2️⃣ Configure _deno_make_ tasks in `deno.jsonc`

```jsonc
// deno.jsonc
{
  // 🍳 deno_make configuration
  "+tasks": {
    "start": { // ▶️ `deno task make start`
      "description": "🍱 Start application",
      "task": "deno run mod.ts",
      "deno": { // ✨ Configure deno flags in a descriptive way
        "run": { // ⚙️ `deno run`
          "unstable": ["kv"], // ➡️ --unstable-kv
          "permissions": {
            "read": true, // ➡️ --allow-read
            "run": false, // ➡️ --deny-run
            "net": [ // ➡️ --allow-net=https://deno.land,https://example.com
              "https://deno.land",
              "https://example.com"
            ],
            "prompt": false // ➡️ --no-prompt
          }
        }
      },
      "env": { // ✨ Configure environment variables directly
        "FOO": true, // ➡️ Inherit current FOO environment variable
        "BAR": "bar" // ➡️ Set BAR environment variable to "bar"
      }
    }
  }
}
```

> [!NOTE] It is even possible to alias `deno task make <+task>` to `deno task <+task>` !
>
> ```jsonc
> // deno.jsonc
> {
>   "tasks": {
>     "start": "deno task make start",
>     "test": "deno task make test"
>   }
> }
> ```

### 3️⃣ Run tasks with _deno_make_

```bash
deno task make <+task>
```

> [!NOTE] If _deno_make_ was aliased back to `deno task`, just use the following instead:
>
> ```bash
> deno task start
> ```

To print the list of available tasks with their configuration, run _deno_make_ without arguments:

```bash
deno task make
```

## 📜 License

```
MIT License
Copyright (c) 2023 Simon Lecoq
```
