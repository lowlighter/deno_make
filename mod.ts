// Imports
import * as JSONC from "https://deno.land/std@0.205.0/jsonc/mod.ts"
import { z as is } from "https://deno.land/x/zod@v3.21.4/mod.ts"
import { fromZodError } from "https://esm.sh/zod-validation-error@1.5.0?pin=v133"
import { bgBrightBlue, bold, gray, italic, underline, yellow } from "https://deno.land/std@0.205.0/fmt/colors.ts"

// Structure flags =========================================================================================================

/** Common flags */
const common = is.object({
  unstable: is.union([
    is.boolean().transform((v) => v ? "--unstable" : ""),
    is.array(is.string()).transform((v) => v.length ? v.map((w) => `--unstable-${w}`) : ""),
  ]).optional(),
  quiet: is.boolean().optional().transform((v) => v ? "--quiet" : ""),
  config: is.union([
    is.boolean().transform((v) => v === false ? "--no-config" : ""),
    is.string().min(1).transform((v) => `--config='${v}'`),
  ]).optional(),
  importMap: is.string().optional().transform((v) => v ? `--import-map='${v}'` : ""),
  cert: is.string().optional().transform((v) => v ? `--cert='${v}'` : ""),
})

/** Common runnable flags */
const runnable = is.object({
  location: is.string().optional().transform((v) => v ? `--location='${v}'` : ""),
  seed: is.number().optional().transform((v) => typeof v === "number" ? `--seed=${v}` : ""),
  v8Flags: is.array(is.string()).optional().transform((v) => v?.length ? `--v8-flags='${v.join(",")}'` : ""),
  certificateErrors: is.boolean().optional().transform((v) =>
    v === false ? "--unsafely-ignore-certificate-errors" : ""
  ),
  env: is.union([
    is.boolean().transform((v) => v ? "--env" : ""),
    is.string().min(1).transform((v) => `--env='${v}'`),
  ]).optional(),
})

/** Lock file flags */
const lock = {
  check: is.string().min(1).optional().transform((v) => `--lock='${v}'`),
  read: is.union([
    is.boolean().transform((v) => v === false ? "--no-lock" : ""),
    is.string().min(1).transform((v) => `--lock='${v}'`),
  ]).optional(),
  write: is.union([
    is.boolean().transform((v) => v === false ? "--no-lock" : ""),
    is.string().min(1).transform((v) => `--lock='${v}'`),
    is.object({
      file: is.string().optional().transform((v) => v ? `--lock='${v}'` : ""),
      write: is.boolean().optional().transform((v) => v ? "--lock-write" : ""),
    }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
  ]).optional(),
}

/** Permissions flags */
const permissions = is.union([
  is.object({
    all: is.boolean().transform((v) => v ? "--allow-all" : "--deny-all"),
    prompt: is.boolean().optional().transform((v) => v === false ? "--no-prompt" : ""),
  }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
  is.object({
    read: is.union([
      is.boolean().transform((v) => v ? "--allow-read" : "--deny-read"),
      is.array(is.string()).transform((v) => v.length ? `--allow-read=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-read=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-read=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    write: is.union([
      is.boolean().transform((v) => v ? "--allow-write" : "--deny-write"),
      is.array(is.string()).transform((v) => v.length ? `--allow-write=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-write=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-write=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    net: is.union([
      is.boolean().transform((v) => v ? "--allow-net" : "--deny-net"),
      is.array(is.string()).transform((v) => v.length ? `--allow-net=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-net=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-net=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    env: is.union([
      is.boolean().transform((v) => v ? "--allow-env" : "--deny-env"),
      is.array(is.string()).transform((v) => v.length ? `--allow-env=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-env=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-env=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    sys: is.union([
      is.boolean().transform((v) => v ? "--allow-sys" : "--deny-sys"),
      is.array(is.string()).transform((v) => v.length ? `--allow-sys=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-sys=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-sys=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    run: is.union([
      is.boolean().transform((v) => v ? "--allow-run" : "--deny-run"),
      is.array(is.string()).transform((v) => v.length ? `--allow-run=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-run=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-run=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    ffi: is.union([
      is.boolean().transform((v) => v ? "--allow-ffi" : "--deny-ffi"),
      is.array(is.string()).transform((v) => v.length ? `--allow-ffi=${v.join(",")}` : ""),
      is.object({
        allow: is.array(is.string()).transform((v) => v.length ? `--allow-ffi=${v.join(",")}` : ""),
        deny: is.array(is.string()).transform((v) => v.length ? `--deny-ffi=${v.join(",")}` : ""),
      }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
    ]).optional(),
    hrtime: is.boolean().optional().transform((v) => v ? "--allow-hrtime" : "--deny-hrtime"),
    prompt: is.boolean().optional().transform((v) => v === false ? "--no-prompt" : ""),
  }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
]).optional()

/** Module flags (internal) */
const _modules = is.object({
  cached: is.boolean().optional().transform((v) => v ? "--cached-only" : ""),
  remote: is.boolean().optional().transform((v) => v === false ? "--no-remote" : ""),
  npm: is.boolean().optional().transform((v) => v === false ? "--no-npm" : ""),
  check: is.union([
    is.boolean().transform((v) => v ? "--check=all" : "--no-check"),
    is.string().min(1).transform((v) => `--check=${v}`),
  ]).optional(),
  reload: is.union([
    is.boolean().transform((v) => v ? "--reload" : ""),
    is.array(is.string()).transform((v) => v.length ? `--reload=${v.join(",")}` : ""),
  ]).optional(),
  node_modules: is.boolean().optional().transform((v) => typeof v === "boolean" ? `--node-modules-dir=${v}` : ""),
  vendor: is.boolean().optional().transform((v) => typeof v === "boolean" ? `--vendor=${v}` : ""),
})

/** Module flags */
const modules = {
  all: _modules.optional().transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
  nocache: _modules.pick({
    check: true,
    reload: true,
    npm: true,
    remote: true,
    node_modules: true,
    vendor: true,
  })
    .optional()
    .transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
  vendor: _modules.pick({
    reload: true,
    node_modules: true,
    vendor: true,
  }).optional().transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
  doc: _modules.pick({ reload: true, npm: true, remote: true }).optional()
    .transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
  nocheck: _modules.pick({
    reload: true,
    npm: true,
    remote: true,
    node_modules: true,
    vendor: true,
  }).optional()
    .transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
}

/** Inspect flags */
const inspect = is.union([
  is.string().min(1).transform((v) => `--inspect='${v}'`),
  is.object({
    listen: is.string().min(1).optional().transform((v) => v ? `--inspect='${v}'` : ""),
    break: is.string().min(1).optional().transform((v) => v ? `--inspect-brk='${v}'` : ""),
    wait: is.string().min(1).optional().transform((v) => v ? `--inspect-wait='${v}'` : ""),
  }).transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
]).optional()

/** Watch flags */
const watch = is.union([
  is.boolean().transform((v) => v ? "--watch" : ""),
  is.array(is.string()).transform((v) => v.length ? `--watch='${v.join(",")}'` : ""),
  is.object({
    files: is.array(is.string()).optional().transform((v) => v?.length ? `--watch='${v.join(",")}'` : ""),
    clearScreen: is.boolean().optional().transform((v) => v === false ? "--no-clear-screen" : ""),
  }).transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
]).optional()

// Deno flags =========================================================================================================

const bench = common.merge(runnable).extend({
  lock: lock.write,
  modules: modules.all,
  json: is.boolean().optional().transform((v) => v ? "--json" : ""),
  run: is.boolean().optional().transform((v) => v === false ? "--no-run" : ""),
  watch,
  ignore: is.array(is.string()).optional().transform((v) => v?.length ? `--ignore='${v.join(",")}'` : ""),
  filter: is.string().optional().transform((v) => v ? `--filter='${v}'` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const bundle = common.extend({
  lock: lock.write,
  modules: modules.nocache,
  watch,
  ext: is.string().optional().transform((v) => v ? `--ext=${v}` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const cache = common.extend({
  lock: lock.write,
  modules: modules.nocache,
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const check = common.extend({
  lock: lock.write,
  modules: modules.nocheck,
  all: is.boolean().optional().transform((v) => v ? "--all" : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const compile = common.merge(runnable).extend({
  permissions,
  lock: lock.write,
  modules: modules.all,
  include: is.array(is.string()).optional().transform((v) => v?.length ? v.map((w) => `--include=${w}`).join(" ") : ""),
  output: is.string().optional().transform((v) => v ? `--output='${v}'` : ""),
  target: is.string().optional().transform((v) => v ? `--target='${v}'` : ""),
  terminal: is.boolean().optional().transform((v) => v === false ? "--no-terminal" : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const coverage = common.pick({ unstable: true, quiet: true }).extend({
  ignore: is.array(is.string()).optional().transform((v) => v?.length ? `--ignore='${v.join(",")}'` : ""), //TODO
  lcov: is.boolean().optional().transform((v) => v ? "--lcov" : ""),
  include: is.string().optional().transform((v) => v ? `--include='${v}'` : ""),
  exclude: is.string().optional().transform((v) => v ? `--exclude='${v}'` : ""),
  output: is.string().optional().transform((v) => v ? `--output='${v}'` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const doc = common.pick({ unstable: true, quiet: true, importMap: true })
  .extend({
    lock: lock.read,
    modules: modules.doc,
    private: is.boolean().optional().transform((v) => v ? "--private" : ""),
    json: is.boolean().optional().transform((v) => v ? "--json" : ""),
    html: is.boolean().optional().transform((v) => v ? "--html" : ""),
    name: is.string().optional().transform((v) => v ? `--name='${v}'` : ""),
    output: is.string().optional().transform((v) => v ? `--output='${v}'` : ""),
  }).transform((v) => Object.values(v).filter(Boolean).join(" "))

const _eval = common.merge(
  runnable.pick({ location: true, v8Flags: true, seed: true }),
).extend({
  lock: lock.write,
  modules: modules.all,
  inspect,
  ext: is.string().optional().transform((v) => v ? `--ext=${v}` : ""),
  print: is.boolean().optional().transform((v) => v ? "--print" : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const fmt = common.pick({ config: true, unstable: true, quiet: true }).extend({
  watch,
  check: is.boolean().optional().transform((v) => v ? "--check" : ""),
  tabs: is.boolean().optional().transform((v) => typeof v === "boolean" ? `--use-tabs=${v}` : ""),
  lineWidth: is.number().optional().transform((v) => v ? `--line-width=${v}` : ""),
  indentWidth: is.number().optional().transform((v) => v ? `--indent-width=${v}` : ""),
  singleQuote: is.boolean().optional().transform((v) => typeof v === "boolean" ? `--single-quote=${v}` : ""),
  semicolons: is.boolean().optional().transform((v) => v === false ? "--no-semicolons" : ""),
  proseWrap: is.string().optional().transform((v) => v ? `--prose-wrap=${v}` : ""),
  ignore: is.array(is.string()).optional().transform((v) => v?.length ? `--ignore='${v.join(",")}'` : ""),
  ext: is.string().optional().transform((v) => v ? `--ext=${v}` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const info = common.merge(runnable.pick({ location: true })).extend({
  lock: lock.read,
  json: is.boolean().optional().transform((v) => v ? "--json" : ""),
  modules: modules.nocache,
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const install = common.merge(runnable).extend({
  permissions,
  lock: lock.write,
  modules: modules.all,
  inspect,
  root: is.string().optional().transform((v) => v ? `--root='${v}'` : ""),
  name: is.string().optional().transform((v) => v ? `--name='${v}'` : ""),
  force: is.boolean().optional().transform((v) => v ? "--force" : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const lint = common.pick({ config: true, unstable: true, quiet: true }).extend({
  rules: is.object({
    tags: is.array(is.string()).optional().transform((v) => v?.length ? `--rules-tags=${v.join(",")}` : ""),
    include: is.array(is.string()).optional().transform((v) => v?.length ? `--rules-include=${v.join(",")}` : ""),
    exclude: is.array(is.string()).optional().transform((v) => v?.length ? `--rules-exclude=${v.join(",")}` : ""),
  }).optional().transform((v) => Object.values(v ?? {}).filter(Boolean).join(" ")),
  ignore: is.array(is.string()).optional().transform((v) => v?.length ? `--ignore='${v.join(",")}'` : ""),
  json: is.boolean().optional().transform((v) => v ? "--json" : ""),
  compact: is.boolean().optional().transform((v) => v ? "--compact" : ""),
  watch,
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const repl = common.merge(runnable).extend({
  lock: lock.write,
  modules: modules.all,
  inspect,
  eval: is.string().optional().transform((v) => v ? `--eval='${v}'` : ""),
  evalFile: is.array(is.string()).optional().transform((v) => v?.length ? `--eval-file='${v.join(",")}'` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const run = common.merge(runnable).extend({
  permissions,
  lock: lock.write,
  inspect,
  modules: modules.all,
  watch,
  ext: is.string().optional().transform((v) => v ? `--ext=${v}` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const test = common.merge(runnable).extend({
  permissions,
  lock: lock.write,
  modules: modules.all,
  inspect,
  watch,
  doc: is.boolean().optional().transform((v) => v ? "--doc" : ""),
  traceOps: is.boolean().optional().transform((v) => v ? "--trace-ops" : ""),
  run: is.boolean().optional().transform((v) => v === false ? "--no-run" : ""),
  allowNone: is.boolean().optional().transform((v) => v ? "--allow-none" : ""),
  failFast: is.union([
    is.boolean().transform((v) => v ? "--fail-fast" : ""),
    is.number().transform((v) => `--fail-fast=${v}`),
  ]).optional(),
  shuffle: is.union([
    is.boolean().transform((v) => v ? "--shuffle" : ""),
    is.number().transform((v) => `--shuffle=${v}`),
  ]).optional(),
  parallel: is.boolean().optional().transform((v) => v ? "--parallel" : ""),
  coverage: is.string().optional().transform((v) => v ? `--coverage='${v}'` : ""),
  reporter: is.string().optional().transform((v) => v ? `--reporter=${v}` : ""),
  ignore: is.array(is.string()).optional().transform((v) => v?.length ? `--ignore='${v.join(",")}'` : ""),
  filter: is.string().optional().transform((v) => v ? `--filter='${v}'` : ""),
  junitPath: is.string().optional().transform((v) => v ? `--junit-path='${v}'` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const types = common.pick({
  unstable: true,
  quiet: true,
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const uninstall = common.pick({ quiet: true, unstable: true }).extend({
  root: is.string().optional().transform((v) => v ? `--root='${v}'` : ""),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

const vendor = common.extend({
  lock: lock.check,
  modules: modules.vendor,
  output: is.union([
    is.string().min(1).transform((v) => `--output='${v}'`),
    is.object({
      path: is.string().optional().transform((v) => v ? `--output='${v}'` : ""),
      force: is.boolean().optional().transform((v) => v ? "--force" : ""),
    }).transform((v) => Object.values(v).filter(Boolean).join(" ")),
  ]).optional(),
}).transform((v) => Object.values(v).filter(Boolean).join(" "))

// deno_task flags =========================================================================================================

const _make = is.object({
  task: is.union([is.string(), is.array(is.string())]).transform((v) => Array.isArray(v) ? v.join(" ") : v),
  description: is.union([is.string(), is.array(is.string())]).default("").transform((v) =>
    Array.isArray(v) ? v.join(" ") : v
  ),
  env: is.record(is.string(), is.union([is.boolean(), is.string()])).transform((
    v,
  ) =>
    Object.fromEntries(
      Object.entries(v).map((
        [k, v],
      ) => [k, v === true ? Deno.env.get(k) ?? "" : v === false ? "" : v]),
    )
  ).default(() => ({})),
  cwd: is.string().optional(),
  deno: is.object({
    bench,
    bundle,
    cache,
    check,
    compile,
    coverage,
    doc,
    eval: _eval,
    fmt,
    info,
    install,
    uninstall,
    lint,
    repl,
    run,
    test,
    types,
    vendor,
  }).partial().default(() => ({})),
})

/** Compute command to execute after applying deno flags */
export function command(
  raw: string,
  { deno }: Pick<is.infer<typeof _make>, "deno">,
  { colors = false } = {},
) {
  for (const [subcommand, flags] of Object.entries(deno)) {
    raw = raw.replaceAll(
      `deno ${subcommand}`,
      `deno ${subcommand} ${colors ? italic(underline(flags)) : flags}`,
    )
  }
  return raw
}

/** Entry point */
export async function make(
  {
    task = "",
    config = "deno.jsonc",
    log = console.log,
    exit = true,
    stdio = "inherit" as "inherit" | "piped" | "null",
  } = {},
) {
  const { "+tasks": _tasks = {} } = JSONC.parse(
    await Deno.readTextFile(config),
  ) as {
    "+tasks"?: Record<string, unknown>
  }
  const tasks = Object.fromEntries(
    Object.entries(_tasks).map(([k, v]) => {
      try {
        return [k, _make.parse(v)]
      } catch (error) {
        throw Object.assign(fromZodError(error), { stack: "" })
      }
    }),
  )
  if (task) {
    const { task: raw, env, deno, cwd } = tasks[task]
    const temp = ".deno-make.json"
    const decoder = new TextDecoder()
    try {
      const make = command(raw, { deno })
      await Deno.writeTextFile(temp, JSON.stringify({ tasks: { make } }))
      const process = new Deno.Command("deno", {
        args: ["task", ...(cwd ? ["--cwd", cwd] : []), "--config", temp, "make"],
        stdout: stdio,
        stderr: stdio,
        stdin: stdio,
        env,
        windowsRawArguments: true,
      }).spawn()
      if (stdio === "piped") {
        const { stdout, stderr } = await process.output()
        log(decoder.decode(stdout))
        log(decoder.decode(stderr))
        await process.stdin?.close()
      }
      const { code } = await process.status
      if (exit) {
        Deno.exit(code)
      }
      return { code }
    } finally {
      await Deno.remove(temp).catch(() => null)
    }
  } else if (Object.keys(tasks).length) {
    for (
      const [name, { task, description, env, cwd, deno }] of Object.entries(
        tasks,
      )
    ) {
      const { icon = "" } = description.match(/^(?<icon>[\p{Emoji}\u200d]+) /u)?.groups ?? {}
      log(bgBrightBlue(`${icon} ${bold(name)}`.trim().padEnd(32)))
      log(description.replace(icon, "").trim())
      if (Object.keys(env).length) {
        log(gray(`Environment variables:`))
        for (const [k, v] of Object.entries(env)) {
          const inherited = ((_tasks as Record<string, is.infer<typeof _make>>)[name]
            .env[k] as unknown as string | boolean) === true
          log(
            gray(
              `  ${k}=${v}${inherited ? underline(italic("→ inherited")) : ""}`
                .trim(),
            ),
          )
        }
      }
      if (cwd) {
        log(gray(`Working directory:`))
        log(gray(`  ${cwd}`))
      }
      log(gray(`Task:`))
      log(gray(`  ${command(task, { deno }, { colors: true })}`))
      log("")
    }
    return { code: 0 }
  }
  log(yellow(`"+tasks" is empty in ${config}`))
  return { code: 0 }
}

if (import.meta.main) {
  await make({ task: Deno.args[0] })
}
