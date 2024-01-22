const { app, BrowserWindow, ipcMain, shell, screen, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const lodashClonedeep = require('lodash.clonedeep');

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
            preload: path.resolve(__dirname, "preload.js"),
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
// 插入菜单
function createMenu() {
    const template = [
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' },
                { role: 'pasteandmatchstyle', label: '粘贴和应用样式' },
                { role: 'delete', label: '删除' },
                { role: 'selectall', label: '全选' },
            ],
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'forcereload', label: '强制重载' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全屏切换' },
            ],
        },
        {
            label: '语言',
            submenu: [
                {
                    label: '简体中文',
                    click: () => {
                        // 输出语言切换事件
                        console.log('change-language', 'chinese');
                        app.emit('change-language', 'chinese');
                    }
                },
                {
                    label: 'English',
                    click: () => {
                        // 输出语言切换事件
                        console.log('change-language', 'english');
                        app.emit('change-language', 'english');
                    }
                },
            ],
        },
        {
            label: '帮助',
            submenu: [
                { role: 'toggledevtools', label: '切换开发者工具' },
                { type: 'separator' },
                { role: 'about', label: '关于' },
            ],
        },
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about', label: '关于' },
                { type: 'separator' },
                { role: 'services', label: '服务', submenu: [] },
                { type: 'separator' },
                { role: 'hide', label: '隐藏' },
                { role: 'hideothers', label: '隐藏其他' },
                { role: 'unhide', label: '取消隐藏' },
                { type: 'separator' },
                { role: 'quit', label: '退出' },
            ],
        });
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(createMenu);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 自动更新
function setupAutoUpdater() {
    console.log("检查更新中");
    autoUpdater.on("checking-for-update", () => { });
    autoUpdater.on("update-not-available", () => { });
    autoUpdater.on("error", (error) => { });
    autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall();
    });

    if (process.env.NODE_ENV === "development") {
        autoUpdater.forceDevUpdateConfig = true;
    }

    autoUpdater.checkForUpdates();
}


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

// 监听语言切换事件
ipcMain.on('change-language', (event, language) => {
    if (mainWindow) {
        mainWindow.webContents.send('change-language', language);
        console.log('change-language', language);
    }
});
