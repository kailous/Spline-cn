const { app, Menu } = require('electron');

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
                { label: '中文', click: () => {
                    console.log("中文选项被点击");
                    app.emit('change-language', 'chinese');
                }},
                { label: '英文', click: () => {
                    console.log("英文选项被点击");
                    app.emit('change-language', 'english');
                }}
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

app.on('activate', function () {
    // 通常在这里重建窗口
});
