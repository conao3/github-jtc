import { ApplicationMenu, BrowserWindow } from "electrobun/bun";

const applicationUrl = process.env["JTC_GITHUB_DESKTOP_URL"] ?? "views://web/index.html";

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ role: "quit" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
]);

new BrowserWindow({
  title: "JTC GitHub",
  url: applicationUrl,
  frame: {
    width: 1480,
    height: 960,
    x: 80,
    y: 56,
  },
  titleBarStyle: "default",
  sandbox: false,
});
