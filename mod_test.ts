import { make } from "./mod.ts"
import { expandGlob } from "https://deno.land/std@0.204.0/fs/mod.ts"
import * as JSONC from "https://deno.land/std@0.203.0/jsonc/mod.ts"
import { expect } from "https://esm.sh/chai@4.3.10?pin=v133"

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
        log: (message) => stdio.push(message),
        exit: false,
        stdio: "null",
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

/*Deno.test("deno task make: exit code", async () => {
  const {code} = await make({task:"make", config:"tests/deno_make.jsonc", log:() => null, exit:true})
  expect(code).to.equal(1)
})*/

Deno.test("deno task make: print tasks", async () => {
  const stdio = [] as string[]
  const { code } = await make({ config: "tests/deno_make.jsonc", log: (message) => stdio.push(message), exit: false })
  expect(stdio.join("\n")).to.include("🦕")
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
