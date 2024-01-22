var u = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var m = u((W, D) => {
    D.exports = {
        name: "spline",
        private: !0,
        version: "0.11.0",
        author: "Spline <hello@spline.design>",
        homepage: "https://spline.design",
        main: "src/main.js",
        scripts: {
            prepare: "husky install",
            start: "cross-env NODE_ENV=development electron .", "start:local": "cross-env WEBSITE_URL=http://localhost:3000 NODE_ENV=development electron .",
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
            "electron-log": "^4.4.8", "electron-updater": "^6.1.1", "lodash.clonedeep": "^4.5.0"
        }, devDependencies: { "cross-env": "^7.0.3", dotenv: "^16.3.1", electron: "^25.4.0", "electron-builder": "^24.6.3", "electron-builder-notarize": "^1.5.1", "electron-notarize": "^1.2.2", esbuild: "^0.19.0", eslint: "^8.46.0", "eslint-config-prettier": "^9.0.0", husky: "^8.0.3", "lint-staged": "^13.2.3", prettier: "^3.0.1", rimraf: "^5.0.1" }
    }
});
var h = u((_, g) => {
    var { autoUpdater: o } = require("electron-updater"), { dialog: c } = require("electron"), p = !0, b = !1, r = () => { };
    process.env.NODE_ENV === "development" && (o.forceDevUpdateConfig = !0); 
    o.on("checking-for-update", () => { }); 
    o.on("update-not-available", () => { r({ enabled: !0 }), !p && c.showMessageBox({ title: "No Updates", message: "Current version is up to date." }) }); 
    o.on("error", e => { r({ enabled: !0 }), !p && c.showErrorBox("Error during the update", "Application couldn't be updated. Please try again or contact the support team.") }); 
    o.on("update-downloaded", () => { b = !0, f() }); function N({ silent: e }, t) { if (p = e, r = t, r({ enabled: !1 }), b) { f(); return } o.checkForUpdates() } function f() { c.showMessageBox({ title: "New update available!", message: "A new version of Spline is ready to be installed.", defaultId: 0, cancelId: 1, buttons: ["Reload & Update", "Later"] }).then(({ response: e }) => { e === 0 ? setImmediate(() => o.quitAndInstall()) : r({ enabled: !0 }) }) } g.exports = { checkForUpdates: N }
});
var S = require("path"), { shell: U, screen: w, Menu: i, app: a, BrowserWindow: M,ipcMain: z } = require("electron"), x = m(), { checkForUpdates: v } = h(), B = require("lodash.clonedeep"),
    n
    require('./menu.js');
function k() {
    let e = process.env.WEBSITE_URL || "https://app.spline.design", t = `?desktop-app-version=${x.version}`;
    n = new M({
        width: w.getPrimaryDisplay().workAreaSize.width,
        height: w.getPrimaryDisplay().workAreaSize.height,
        minHeight: 500,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#232323",
        icon: S.resolve(__dirname, "icons/spline_icon.icns"),
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            enableBlinkFeatures: "WebAssemblyCSP",
            preload: S.join(__dirname, './preload.js') // 在这里添加 preload.js 的路径
        }
    });
    n.setMenuBarVisibility(!1), n.loadURL(e + t), process.env.NODE_ENV === "development" && n.webContents.openDevTools({ mode: "undocked" }), n.on("closed", function () { n = null }), n.webContents.setWindowOpenHandler(({ url: l }) => l.startsWith(e) ? { action: "deny" } : { action: "allow" }), n.webContents.on("did-create-window", l => { l.webContents.on("will-navigate", (C, d) => { !d.startsWith(e) && !d.startsWith("https://accounts.google.com") && (l.close(), U.openExternal(d)) }) });  v({ silent: !0 }, E)
} function E({ enabled: e }) {} 
a.on('change-language', (event, language) => {
    if (n) {
        n.webContents.send('change-language', language);
        console.log('change-language', language);
    }
});
a.on("ready", k); process.platform !== "darwin" && a.on("window-all-closed", () => a.quit()); a.on("activate", () => { n === null && k() });