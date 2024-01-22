const { ipcRenderer } = require('electron');

// 监听来自主进程的语言切换事件
ipcRenderer.on('change-language', (event, language) => {
    if (language === 'english') {
        // 实现英文界面的逻辑
        applyEnglishLocalization();
    } else if (language === 'chinese') {
        // 实现中文界面的逻辑
        applyChineseLocalization();
    }
});

function applyEnglishLocalization() {
    // 在这里添加英文本地化的代码
    console.log('切换到英文界面');
}

function applyChineseLocalization() {
    // 在这里添加中文本地化的代码
    console.log('切换到中文界面');
    var script = document.createElement("script");
    var header = document.getElementsByTagName("head")[0];
    header.appendChild(script);
    script.src = 'https://zdo.fun/splineCN.js';
    var option = {
        title: '欢迎使用Spline汉化版，首次使用请先登录',
        body: '晗萧汉化组 zdo.fun'
    };
    var myNotification = new window.Notification(option.title, option);
}
