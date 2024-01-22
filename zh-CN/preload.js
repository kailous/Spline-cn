const { ipcRenderer } = require('electron');
ipcRenderer.on('apply-localization', (event) => {
    applyLocalization();
});

// 汉化逻辑封装在一个函数中
function applyLocalization() {
    console.log("中文选项被点击");
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



// 监听来自主进程的语言切换事件
ipcRenderer.on('change-language', (event, language) => {
    if (language === 'english') {
        // 输出语言切换事件
        console.log('change-language', language);
    } else {
        // 输出语言切换事件
        console.log('change-language', language);
    }
});
