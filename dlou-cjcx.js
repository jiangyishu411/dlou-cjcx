// ==UserScript==
// @name         大连海洋大学教务系统成绩导出工具
// @namespace    http://www.jiangyishu.cn/#/dlou-cjcx/
// @version      2.0
// @description  用于大连海洋大学正方教务系统V8.0的成绩查询及导出功能，蓝绿色主题
// @author       JiangYishu
// @match        https://jwxt.dlou.edu.cn/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=N305005&layout=default
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    // 创建导出按钮（蓝绿色调）
    let ele = $("<button type='button' class='btn btn-default btn_dc' href='javascript:void(0);'><i class='bigger-100 glyphicon glyphicon-export'></i> 导出成绩 </button>");
    ele.css({
        'position': 'fixed',
        'top': '15px',
        'left': '15px',
        'z-index': '9999',
        'background-color': '#20c997', // 主色调：蓝绿色
        'color': 'white',
        'border': 'none',
        'padding': '8px 16px',
        'border-radius': '4px',
        'cursor': 'pointer',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
        'transition': 'background-color 0.2s'
    });

    // 按钮悬停效果（深色蓝绿色）
    ele.hover(
        () => ele.css('background-color', '#17a974'),
        () => ele.css('background-color', '#20c997')
    );

    // 显示取消提示（蓝绿色调）
    function showCancelToast() {
        const toast = document.createElement('div');
        toast.innerHTML = "已取消导出";
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #20c997; // 蓝绿色背景
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            z-index: 99999;
            font-size: 14px;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
        `;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // 1.5秒后消失
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    // 生成时间戳文件名
    function getTimestampFilename() {
        const date = new Date();
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
    }

    // 创建并显示自定义文件名弹窗（蓝绿色调）
    function showFilenameDialog(defaultName, onConfirm, onCancel) {
        // 移除可能存在的旧弹窗
        const oldDialog = document.getElementById('filename-dialog');
        if (oldDialog) oldDialog.remove();

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        overlay.id = 'filename-dialog-overlay';

        // 创建弹窗容器
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transform: translateY(-20px);
            transition: transform 0.3s;
        `;
        dialog.id = 'filename-dialog';

        // 弹窗标题（蓝绿色）
        const title = document.createElement('h3');
        title.textContent = '保存成绩文件';
        title.style.cssText = `
            margin: 0 0 16px 0;
            color: #20c997; // 蓝绿色标题
            font-size: 18px;
            font-weight: 600;
        `;

        // 提示文本 - 修改为新提示文字
        const hint = document.createElement('p');
        hint.textContent = '请输入成绩导出文件的文件名';
        hint.style.cssText = `
            margin: 0 0 12px 0;
            color: #666;
            font-size: 14px;
        `;

        // 输入框（蓝绿色边框）- 使用placeholder显示提示
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '默认为时间戳'; // 淡灰色提示文字
        input.style.cssText = `
            width: 100%;
            padding: 10px 12px;
            margin-bottom: 16px;
            border: 1px solid #20c997; // 蓝绿色边框
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            transition: border-color 0.2s;
        `;
        // 输入框聚焦效果
        input.onfocus = () => input.style.borderColor = '#17a974';
        input.onblur = () => input.style.borderColor = '#20c997';
        input.id = 'filename-input';

        // 开发者信息区域
        const devInfo = document.createElement('div');
        devInfo.style.cssText = `
            margin: 0 0 20px 0;
            padding: 12px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
            line-height: 1.6;
        `;
        devInfo.innerHTML = `
            开发者：江易书<br>
            联系邮箱：jiangyishu@189.cn<br>
            主页：<a href="http://www.jiangyishu.cn" target="_blank" style="color:#20c997; text-decoration: none;">www.jiangyishu.cn</a><br>
            项目链接：<a href="https://github.com/jiangyishu411/dlou-cjcx" target="_blank" style="color:#20c997; text-decoration: none;">https://github.com/jiangyishu411/dlou-cjcx</a>
        `;

        // 按钮容器
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        `;

        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            color: #333;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        `;
        cancelBtn.onmouseover = () => {
            cancelBtn.style.backgroundColor = '#f5f5f5';
            cancelBtn.style.borderColor = '#ccc';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.backgroundColor = 'white';
            cancelBtn.style.borderColor = '#ddd';
        };
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            onCancel();
        };

        // 确认按钮（蓝绿色）
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background-color: #20c997; // 蓝绿色
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#17a974';
        confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#20c997';
        confirmBtn.onclick = () => {
            const value = input.value.trim();
            document.body.removeChild(overlay);
            onConfirm(value);
        };

        // 组装弹窗
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        dialog.appendChild(title);
        dialog.appendChild(hint);
        dialog.appendChild(input);
        dialog.appendChild(devInfo); // 添加开发者信息
        dialog.appendChild(buttons);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 显示动画
        setTimeout(() => {
            overlay.style.opacity = '1';
            dialog.style.transform = 'translateY(0)';
        }, 10);

        // 自动聚焦输入框
        input.focus();

        // 支持Enter键确认，Esc键取消
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
        });
    }

    // 下载文件函数
    function downFile(blob, fileName) {
        downloadLink.download = fileName;
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    }

    // 按钮点击事件
    ele.click(function() {
        const defaultFilename = getTimestampFilename();

        // 显示自定义文件名弹窗
        showFilenameDialog(
            defaultFilename,
            (userInput) => {
                // 确认回调
                let fileName = userInput || defaultFilename;
                if (!fileName.toLowerCase().endsWith('.xlsx')) {
                    fileName += '.xlsx';
                }

                // 发送导出请求
                var xhr = new XMLHttpRequest();
                xhr.open("POST", '/jwglxt/cjcx/cjcx_dcXsKccjList.html', true);
                xhr.responseType = 'blob';
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

                let encodedXnm = encodeURIComponent(document.querySelector('#xnm').value);
                let encodedXqm = encodeURIComponent(document.querySelector('#xqm').value);
                let data = "gnmkdmKey=N305005&xnm=" + encodedXnm + "&xqm=" + encodedXqm + "&dcclbh=JW_N305005_GLY&exportModel.selectCol=kcmc%40%E8%AF%BE%E7%A8%8B%E5%90%8D%E7%A7%B0&exportModel.selectCol=xnmmc%40%E5%AD%A6%E5%B9%B4&exportModel.selectCol=xqmmc%40%E5%AD%A6%E6%9C%9F&exportModel.selectCol=kkbmmc%40%E5%BC%80%E8%AF%BE%E5%AD%A6%E9%99%A2&exportModel.selectCol=kch%40%E8%AF%BE%E7%A8%8B%E4%BB%A3%E7%A0%81&exportModel.selectCol=jxbmc%40%E6%95%99%E5%AD%A6%E7%8F%AD&exportModel.selectCol=xf%40%E5%AD%A6%E5%88%86&exportModel.selectCol=xmcj%40%E6%88%90%E7%BB%A9&exportModel.selectCol=xmblmc%40%E6%88%90%E7%BB%A9%E5%88%86%E9%A1%B9&exportModel.exportWjgs=xls&fileName=%E6%96%87%E4%BB%B91656485751290";

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        downFile(xhr.response, fileName);
                    } else {
                        console.error("请求失败，状态码：" + xhr.status);
                        alert("导出失败，状态码：" + xhr.status);
                    }
                };

                xhr.onerror = function() {
                    console.error("请求发生错误");
                    alert("导出发生错误");
                };

                xhr.ontimeout = function() {
                    console.error("请求超时");
                    alert("导出超时");
                };

                xhr.timeout = 5000;
                xhr.send(data);
            },
            () => {
                // 取消回调
                showCancelToast();
            }
        );
    });

    $('body').append(ele);
})();
