const path = require('path');
const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const electron = require("electron");
const { shell, screen, Menu, app, BrowserWindow } = electron;
const lodashClonedeep = require("lodash.clonedeep");

// Package information
const packageInfo = {
  name: "spline",
  private: true,
  version: "0.11.0",
  author: "Spline <hello@spline.design>",
  homepage: "https://spline.design",
  main: "src/main.js",
  scripts: {
    prepare: "husky install",
    start: "cross-env NODE_ENV=development electron .",
    "start:local": "cross-env WEBSITE_URL=http://localhost:3000 NODE_ENV=development electron .",
    build: "esbuild src/main.js --bundle --minify --platform=node --packages=external --outfile=build/main.js",
    package: "yarn build && rimraf app/ && electron-builder --config ./build.config.js -mwl",
    "package:mac": "yarn build && rimraf app/ && electron-builder --config ./build.config.js -m",
    "package:win": "yarn build && rimraf app/ && electron-builder --config ./build.config.js -w",
    "package:linux": "yarn build && rimraf app/ && electron-builder --config ./build.config.js -l"
  },
  "lint-staged": {
    "*.{js,css,md}": "prettier --write"
  },
  dependencies: {
    "electron-log": "^4.4.8",
    "electron-updater": "^6.1.1",
    "lodash.clonedeep": "^4.5.0"
  },
  devDependencies: {
    "cross-env": "^7.0.3",
    dotenv: "^16.3.1",
    electron: "^25.4.0",
    "electron-builder": "^24.6.3",
    "electron-builder-notarize": "^1.5.1",
    "electron-notarize": "^1.2.2",
    esbuild: "^0.19.0",
    eslint: "^8.46.0",
    "eslint-config-prettier": "^9.0.0",
    husky: "^8.0.3",
    "lint-staged": "^13.2.3",
    prettier: "^3.0.1",
    rimraf: "^5.0.1"
  }
};

var updateAvailable = false;
var silentUpdate = true;
var updateStatusCallback = () => {};

if (process.env.NODE_ENV === "development") {
  autoUpdater.forceDevUpdateConfig = true;
}

autoUpdater.on("checking-for-update", () => {});

autoUpdater.on("update-not-available", () => {
  updateStatusCallback({ enabled: true });
  if (!silentUpdate) {
    dialog.showMessageBox({
      title: "暂时没有更新",
      message: "当前版本已是最新。"
    });
  }
});

autoUpdater.on("error", error => {
  updateStatusCallback({ enabled: true });
  if (!silentUpdate) {
    dialog.showErrorBox("更新过程中出错", "应用程序无法更新。请重试或联系支持团队。");
  }
});

autoUpdater.on("update-downloaded", () => {
  updateAvailable = true;
  promptUpdateInstallation();
});

function checkForUpdates({ silent }, callback) {
  silentUpdate = silent;
  updateStatusCallback = callback;
  updateStatusCallback({ enabled: false });

  if (updateAvailable) {
    promptUpdateInstallation();
    return;
  }

  autoUpdater.checkForUpdates();
}

function promptUpdateInstallation() {
  dialog.showMessageBox({
    title: "新版本更新可用！",
    message: "Spline 的新版本已准备好安装。安装更新后，汉化会失效，需要重新安装汉化。如果需要继续使用汉化，更新前请先确认汉化是否适配了新版本。",
    defaultId: 0,
    cancelId: 1,
    buttons: ["重新加载并更新", "稍后"]
  }).then(({ response }) => {
    if (response === 0) {
      setImmediate(() => autoUpdater.quitAndInstall());
    } else {
      updateStatusCallback({ enabled: true });
    }
  });
}

var mainWindow;
var menuTemplate = [
  ...process.platform === "darwin" ? [{
    label: app.getName(),
    submenu: [
      { role: "about", label: "关于" },
      { label: "检查更新...", enabled: false, click: () => checkForUpdates({ silent: false }, updateMenu) },
      { type: "separator" },
      { role: "services", submenu: [], label: "服务" },
      { type: "separator" },
      { role: "hide", label: "隐藏" },
      { role: "hideothers", label: "隐藏其他" },
      { role: "unhide", label: "取消隐藏" },
      { type: "separator" },
      { role: "quit", label: "退出" }
    ]
  }] : [],
  {
    label: "编辑",
    submenu: [
      { role: "undo", label: "撤销" },
      { role: "redo", label: "重做" },
      { type: "separator" },
      { role: "cut", label: "剪切" },
      { role: "copy", label: "复制" },
      { role: "paste", label: "粘贴" },
      { role: "pasteandmatchstyle", label: "粘贴并匹配样式" },
      { role: "delete", label: "删除" },
      { role: "selectall", label: "全选" }
    ]
  },
  {
    label: "视图",
    submenu: [
      { role: "reload", label: "重新加载" },
      { role: "forcereload", label: "强制重载" },
      { type: "separator" },
      { role: "togglefullscreen", label: "全屏切换" }
    ]
  },
  {
    label: "帮助",
    submenu: [
      { label: "Spline 官网", click: () => shell.openExternal(packageInfo.homepage) },
      { label: "Spline 汉化", click: () => shell.openExternal("https://github.com/kailous/Spline-cn") },
        { type: "separator" },
        { label: "报告问题", click: () => shell.openExternal("https://github.com/kailous/Spline-cn/issues") },
        { label: "联系我们", click: () => shell.openExternal("mailto:kailous@live.cn") },
        { type: "separator" },
        // 开发者控制台
        { label: "开发者控制台", click: () => mainWindow.webContents.openDevTools({ mode: "undocked" }) }
        ]
  }
];

function createWindow() {
  let websiteUrl = process.env.WEBSITE_URL || "https://app.spline.design";
  let queryParams = `?desktop-app-version=${packageInfo.version}`;
  mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    minHeight: 500,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#232323",
    icon: path.resolve(__dirname, "icons/spline_icon.icns"),
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      enableBlinkFeatures: "WebAssemblyCSP",
      preload: path.resolve(__dirname, "preload.js")
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(websiteUrl + queryParams);

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "undocked" });
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(websiteUrl)) {
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("did-create-window", childWindow => {
    childWindow.webContents.on("will-navigate", (event, navigateUrl) => {
      if (!navigateUrl.startsWith(websiteUrl) && !navigateUrl.startsWith("https://accounts.google.com")) {
        childWindow.close();
        shell.openExternal(navigateUrl);
      }
    });
  });

  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  checkForUpdates({ silent: true }, updateMenu);
}

function updateMenu({ enabled }) {
  let updatedTemplate = lodashClonedeep(menuTemplate);
  updatedTemplate[0].submenu[1].enabled = enabled;
  let updatedMenu = Menu.buildFromTemplate(updatedTemplate);
  Menu.setApplicationMenu(updatedMenu);
}

app.on("ready", createWindow);

if (process.platform !== "darwin") {
  app.on("window-all-closed", () => app.quit());
}

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
