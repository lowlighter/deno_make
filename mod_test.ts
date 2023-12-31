import { make } from "./mod.ts"
import { expandGlob } from "https://deno.land/std@0.205.0/fs/mod.ts"
import * as JSONC from "https://deno.land/std@0.205.0/jsonc/mod.ts"
import chai from "https://esm.sh/chai@4.3.10?pin=v133"
import chaiAsPromised from "https://esm.sh/chai-as-promised@7.1.1?pin=v133"
const { expect } = chai.use(chaiAsPromised)

for await (const { path, name: _name } of expandGlob("tests/*.jsonc")) {
  const name = _name.replace(".jsonc", "").replaceAll("_", " ")
  const { "+tasks": tasks = {} } = JSONC.parse(await Deno.readTextFile(path)) as { "+tasks"?: Record<string, unknown> }
  for (const task in tasks) {
    if (name.startsWith("deno make")) {
      continue
    }
    Deno.test(`${name}: ${task}`, async () => {
      const stdio = [] as string[]
      const { code } = await make({
        task,
        config: path,
        stdio: "piped",
        log: (message) => stdio.push(message),
        exit: false,
      })
      try {
        expect(code).to.equal(0)
      } catch (error) {
        console.log(...stdio)
        throw error
      }
    })
  }
}

Deno.test("deno task make: print tasks", async () => {
  const stdio = [] as string[]
  const { code } = await make({ config: "tests/deno_make.jsonc", log: (message) => stdio.push(message), exit: false })
  expect(stdio.join("\n")).to.include("🦕")
  expect(code).to.equal(0)
})

Deno.test("deno task make: args", async () => {
  const stdio = [] as string[]
  const { code } = await make({
    task: "make:args",
    argv: ["🦕"],
    config: "tests/deno_make.jsonc",
    log: (message) => stdio.push(message),
    stdio: "piped",
    exit: false,
  })
  expect(stdio.join("\n")).to.include("🦕").and.to.include("🦖")
  expect(code).to.equal(0)
})

Deno.test("deno task make: missing args required throw", async () => {
  await expect(make({ task: "make:args", argv: [], config: "tests/deno_make.jsonc", stdio: "null", exit: false })).to.be
    .rejectedWith(Error, /missing argument/i)
})

Deno.test("deno task make: pass all arguments", async () => {
  const stdio = [] as string[]
  const { code } = await make({
    task: "make:args_pass_all",
    argv: ["--foo", "🦕", "🦖"],
    config: "tests/deno_make.jsonc",
    log: (message) => stdio.push(message),
    stdio: "piped",
    exit: false,
  })
  expect(stdio.join("\n")).to.include("--foo").to.include("🦕").and.to.include("🦖")
  expect(code).to.equal(0)
})

Deno.test("deno task make: flags", async () => {
  const stdio = [] as string[]
  const { code } = await make({
    task: "make:flags",
    argv: ["--foo", "🦕"],
    config: "tests/deno_make.jsonc",
    log: (message) => stdio.push(message),
    stdio: "piped",
    exit: false,
  })
  expect(stdio.join("\n")).to.include("🦕").and.to.include("🦖")
  expect(code).to.equal(0)
})

Deno.test("deno task make: exit code", async () => {
  const { exit } = Deno
  try {
    let code = 0
    Object.assign(Deno, { exit: (rc: number) => code = rc })
    await make({ task: "make:exit", config: "tests/deno_make.jsonc", exit: true, stdio: "null" })
    expect(code).to.equal(1)
  } finally {
    Object.assign(Deno, { exit })
  }
})

Deno.test("deno task make: handle removal of .deno-make.json gracefully", async () => {
  const { code } = await make({
    task: "make:rm_deno_make_json",
    config: "tests/deno_make.jsonc",
    exit: false,
    stdio: "null",
  }).catch((error) => error)
  expect(code).to.equal(0)
})

Deno.test("deno task make: tasks empty", async () => {
  const stdio = [] as string[]
  const { code } = await make({
    config: "tests/deno_make_empty.jsonc",
    log: (message) => stdio.push(message),
    exit: false,
  })
  expect(stdio.join("\n")).to.include('"+tasks" is empty')
  expect(code).to.equal(0)
})

Deno.test("deno task make: tasks error", async () => {
  const result = await make({ config: "tests/deno_make_error.jsonc", exit: false }).catch((error) => error)
  expect(result).to.be.an.instanceOf(Error)
})
