export {};

const vitePlusBinary = new URL("../node_modules/vite-plus/bin/vp", import.meta.url).pathname;

const commands: ReadonlyArray<{ readonly name: string; readonly cmd: string[] }> = [
  { name: "vp", cmd: [vitePlusBinary, "check"] },
  { name: "knip", cmd: ["knip", "--config", "knip.json"] },
];

const children = commands.map(({ name, cmd }) => ({
  name,
  process: Bun.spawn(cmd, {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }),
}));

const results = await Promise.all(
  children.map(async ({ name, process }) => {
    const exitCode = await process.exited;
    return { name, exitCode };
  }),
);

const failures = results.filter(({ exitCode }) => exitCode !== 0);

if (failures.length > 0) {
  console.error(failures.map(({ name, exitCode }) => `${name} exited with status ${exitCode}`).join("\n"));
  process.exit(1);
}
