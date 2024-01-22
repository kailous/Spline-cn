const { app, BrowserWindow, ipcMain, shell, screen, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const lodashClonedeep = require('lodash.clonedeep');

require('./menu.js');

let mainWindow;

function createMainWindow() {
    const primaryDisplay = screen.getPrimaryDisplay().workAreaSize;
    const mainWindowUrl = process.env.WEBSITE_URL || "https://app.spline.design";
    const windowOptions = {
        width: primaryDisplay.width,
        height: primaryDisplay.height,
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
            preload: path.join(__dirname, './preload.js')
        }
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(`${mainWindowUrl}?desktop-app-version=${app.getVersion()}`);

    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools({ mode: "undocked" });
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        return url.startsWith(mainWindowUrl) ? { action: "deny" } : { action: "allow" };
    });

    mainWindow.webContents.on("did-create-window", (childWindow) => {
        childWindow.webContents.on("will-navigate", (event, url) => {
            if (!url.startsWith(mainWindowUrl) && !url.startsWith("https://accounts.google.com")) {
                childWindow.close();
                shell.openExternal(url);
            }
        });
    });

    setupAutoUpdater();
}

function setupAutoUpdater() {
    autoUpdater.on("checking-for-update", () => {});
    autoUpdater.on("update-not-available", () => {});
    autoUpdater.on("error", (error) => {});
    autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall();
    });

    if (process.env.NODE_ENV === "development") {
        autoUpdater.forceDevUpdateConfig = true;
    }

    autoUpdater.checkForUpdates();
}

ipcMain.on('change-language', (event, language) => {
    if (mainWindow) {
        mainWindow.webContents.send('change-language', language);
        console.log('change-language', language);
    }
});

app.on("ready", createMainWindow);
app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
