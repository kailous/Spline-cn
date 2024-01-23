#!/bin/bash

# 构建目录
Spline="/Applications/Spline.app"
SplineAppFiles="$Spline/Contents/Resources"
Backup="$SplineAppFiles/Backup"

# 汉化脚本仓库所有者和仓库名
owner="kailous"
repo="Spline-cn"
github_url="https://github.com/$owner/$repo"

# 构建欢迎信息图像
patternImg=("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
    "nnnn                         nnnn"
    "nnnnnnn                          nnnn"
    "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
    "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
    "nnnnnnnn                           nnn"
    "nnnnnnnn    nnnnnnnn     nnnnnnn   nnn"
    "nnnnnnnn      nnnnnnn      nnn     nnn"
    "nnnnnnnn      nnnnnnnn     nnn     nnn"
    "nnnnnnnn      nnnnnnnnnn   nnn     nnn"
    "nnnnnnnn      nnn nnnnnnn  nnn     nnn"
    "nnnnnnnn      nnn  nnnnnnnnnnn     nnn"
    "nnnnnnnn      nnn   nnnnnnnnnn     nnn"
    "nnnnnnnn      nnn    nnnnnnnnn     nnn"
    "nnnnnnnn      nnn      nnnnnnn     nnn"
    "nnnnnnnn    nnnnnnnn    nnnnnn     nnn"
    "  nnnnnn                           nnn"
    "    nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
    "      nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
    "")
# 构建欢迎信息文本
patternText=(
    "======================================"
    ""
    "嗨～，欢迎使用 Spline 汉化工具 MacOS v1.0.0"
    "作者：Rainforest"
    ""
    "原汉化包作者 $owner ，仓库 $repo"
    "仓库地址: $github_url"
    ""
    "======================================"
    "")

# 欢迎信息输出函数
welcome() {
    # 输出欢迎信息图像
    for line in "${patternImg[@]}"; do
        echo -e "\033[32m$line\033[0m"
    done
    # 输出欢迎信息文本
    for line in "${patternText[@]}"; do
        echo -e "$line"
    done

}

# 绿色字体输出函数
success() {
    echo -e "\033[32m$1\033[0m"
}

# 红色字体输出函数
error() {
    echo -e "\033[31m$1\033[0m"
}

# 分隔线输出函数
line() {
    # 获取终端的宽度
    width=$(tput cols)

    # 生成一个宽度等于终端宽度的等号分隔线
    separator=$(printf '%*s' "$width" | tr ' ' '=')

    # 输出分隔线
    echo ""
    echo "$separator"
    echo ""
}

# 备份函数——备份 app.asar
backup_asar() {
    # 判断备份文件夹是否存在
    if [ ! -d "$Backup" ]; then
        # 创建备份文件夹
        mkdir "$Backup"
    fi
    # 备份 app.asar 原始文件
    if [ -f "$SplineAppFiles/app.asar" ]; then
        # 备份 $NotionAppFiles/app.asar
        mv "$SplineAppFiles/app.asar" "$Backup/app.asar"
        # 判断是否备份成功
        if [ $? -eq 0 ]; then
            success "app.asar 原始文件备份成功！"
        else
            error "app.asar 原始文件备份失败！"
            exit 1
        fi
    else
        if [ -f "$Backup/app.asar" ]; then
            success "app.asar 原始文件已经备份过！"
        else
            error "app.asar 原始文件不存在！"
            exit 1
        fi
    fi
}

# MacOS重启函数
MacOS_restart() {
    # 判断 Notion 是否在运行，如果不在运行则启动，如果在运行则重启
    if [[ $(ps aux | grep -i "Spline.app/Contents/MacOS/Spline" | grep -v grep | wc -l) -eq 0 ]]; then
        success "Spline 未运行，正在启动..."
        open -a /Applications/Spline.app
    else
        killall Spline
        # 等待 2 秒
        success "Spline 已运行，正在重启..."
        sleep 2
        open -a /Applications/Spline.app
    fi
}

# 下载链接获取函数
download_url() {
    # 调用GitHub API获取最新的release信息
    api_url="https://api.github.com/repos/$owner/$repo/releases/latest"
    response=$(curl -s $api_url)

    # 使用grep和cut提取mac和win的下载链接
    # download_url_mac=$(echo "$response" | grep -o "https://[^ \"]*app\.mac\.zip" | head -1)
    # download_url_win=$(echo "$response" | grep -o "https://[^ \"]*app\.win\.zip" | head -1)
    download_url_mac=$(echo "$response" | grep -o "https://[^ \"]*app.zip" | head -1)


    # 单独检查每个下载链接
    if [ -z "$download_url_mac" ]; then
        error "错误：无法获取Mac下载链接。"
        return 1 # 返回非零值表示有错误发生
    fi
}

# 创建解压缩函数
unzip_file() {
    echo "正在解压汉化包..."
    echo ""
    # 解压zip文件，覆盖原文件，仅显示进度条
    unzip -o "$SplineAppFiles/app.zip" -d "$SplineAppFiles"
    # 判断是否解压成功
    if [ $? -eq 0 ]; then
        echo ""
        success "汉化包解压成功！"
        # 删除zip文件
        rm -rf "$SplineAppFiles/app.zip"
        line
    else
        error "汉化包解压失败！"
        line
        exit 1
    fi
}

# 创建下载函数
download_file() {
    echo "正在下载汉化包..."
    echo ""
    # 下载zip文件到 SplineAppFiles
    curl -L -o "$SplineAppFiles/app.zip" $download_url_mac
    echo ""
    # 判断是否下载成功
    if [ $? -eq 0 ]; then
        success "汉化包下载成功！"
        line
        unzip_file
    else
        error "汉化包下载失败！"
        line
        exit 1
    fi
}

welcome
backup_asar
download_url
download_file
MacOS_restart