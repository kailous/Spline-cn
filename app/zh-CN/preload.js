setTimeout(function(){
    var script = document.createElement("script");
    var header = document.getElementsByTagName("head")[0];
    header.appendChild(script);
    script.src = 'https://zdo.fun/splineCN.js';
    var option = {
        title: '欢迎使用Spline汉化版，首次使用请先登录',
        body: '晗萧汉化组 zdo.fun'
    };
    var myNotification = new window.Notification(option.title,option);
},600)