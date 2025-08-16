// ==UserScript==
// @name         大连海洋大学教务系统成绩导出工具
// @namespace    http://www.jiangyishu.cn/#/dlou-cjcx/
// @version      2.2
// @description  用于大连海洋大学正方教务系统V8.0的成绩查询及导出功能，蓝绿色主题（按钮美化版）
// @author       JiangYishu
// @match        https://jwxt.dlou.edu.cn/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=N305005&layout=default
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const baseStyle = {
        font: '"Microsoft YaHei", "Heiti SC", Arial, sans-serif',
        boxSizing: 'border-box',
        margin: '0',
        padding: '0',
        listStyle: 'none'
    };

    let downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    let ele = $("<button type='button' class='btn btn-default btn_dc' href='javascript:void(0);'><i class='bigger-100 glyphicon glyphicon-export'></i> 导出成绩 </button>");
    ele.css({
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: '9999',
        backgroundColor: '#20c997',
        color: 'white',
        border: 'none',
        padding: '9px 18px',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 3px 6px rgba(32, 201, 151, 0.3)',
        transition: 'all 0.25s ease',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
        textAlign: 'center',
        fontFamily: baseStyle.font
    });
    
    ele.hover(
        () => ele.css({
            backgroundColor: '#17a974',
            boxShadow: '0 4px 8px rgba(23, 169, 116, 0.4)',
            transform: 'translateY(-1px)'
        }),
        () => ele.css({
            backgroundColor: '#20c997',
            boxShadow: '0 3px 6px rgba(32, 201, 151, 0.3)',
            transform: 'translateY(0)'
        })
    );
    ele.mousedown(() => ele.css({
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(32, 201, 151, 0.2)'
    }));

    function showCancelToast() {
        const toast = document.createElement('div');
        toast.innerHTML = "已取消导出";
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #20c997;
            color: white;
            padding: 8px 14px;
            border-radius: 6px;
            z-index: 99999;
            font-size: 14px;
            line-height: 1.5;
            text-align: center;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            font-family: ${baseStyle.font};
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    function getTimestampFilename() {
        const date = new Date();
        return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
    }

    function showFilenameDialog(defaultName, onConfirm, onCancel) {
        const oldDialog = document.getElementById('filename-dialog');
        if (oldDialog) oldDialog.remove();

        const overlay = document.createElement('div');
        overlay.id = 'filename-dialog-overlay';
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
            font-family: ${baseStyle.font};
        `;

        const dialog = document.createElement('div');
        dialog.id = 'filename-dialog';
        dialog.style.cssText = `
            background-color: white;
            padding: 24px;
            border-radius: 10px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
            transform: translateY(-20px);
            transition: transform 0.3s ease;
            font-family: ${baseStyle.font};
        `;

        const title = document.createElement('h3');
        title.textContent = '保存成绩文件';
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            color: #20c997;
            margin: 0 0 18px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
            line-height: 1.4;
        `;

        const hint = document.createElement('p');
        hint.textContent = '请输入成绩导出文件的文件名';
        hint.style.cssText = `
            font-size: 14px;
            color: #666;
            margin: 0 0 14px 0;
            line-height: 1.5;
        `;

        const input = document.createElement('input');
        input.id = 'filename-input';
        input.type = 'text';
        input.placeholder = '默认为时间戳';
        input.style.cssText = `
            width: 100%;
            padding: 11px 14px;
            margin-bottom: 18px;
            border: 1px solid #20c997;
            border-radius: 6px;
            font-size: 14px;
            color: #333;
            line-height: 1.5;
            transition: all 0.2s;
            font-family: ${baseStyle.font};
        `;
        input.onfocus = () => {
            input.style.borderColor = '#17a974';
            input.style.boxShadow = '0 0 0 3px rgba(23, 169, 116, 0.1)';
            input.style.outline = 'none';
        };
        input.onblur = () => {
            input.style.borderColor = '#20c997';
            input.style.boxShadow = 'none';
        };

        const devInfo = document.createElement('div');
        devInfo.style.cssText = `
            margin: 0 0 22px 0;
            padding: 14px;
            background-color: #f8f9fa;
            border-radius: 6px;
            font-size: 12px;
            color: #666;
            line-height: 1.8;
        `;
        devInfo.innerHTML = `
            开发者：江易书<br>
            联系邮箱：jiangyishu@189.cn<br>
            主页：<a href="http://www.jiangyishu.cn" target="_blank" style="color:#20c997; text-decoration: none; outline: none;">www.jiangyishu.cn</a><br>
            项目链接：<a href="https://github.com/jiangyishu411/dlou-cjcx" target="_blank" style="color:#20c997; text-decoration: none; outline: none;">https://github.com/jiangyishu411/dlou-cjcx</a>
        `;

        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 8px;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 9px 18px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background-color: white;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            line-height: 1.5;
            text-align: center;
            transition: all 0.25s ease;
            font-family: ${baseStyle.font};
        `;
        
        cancelBtn.onmouseover = () => {
            cancelBtn.style.backgroundColor = '#fafafa';
            cancelBtn.style.borderColor = '#d0d0d0';
            cancelBtn.style.color = '#333';
            cancelBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.backgroundColor = 'white';
            cancelBtn.style.borderColor = '#e0e0e0';
            cancelBtn.style.color = '#666';
            cancelBtn.style.boxShadow = 'none';
        };
        cancelBtn.onmousedown = () => {
            cancelBtn.style.transform = 'translateY(1px)';
            cancelBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        };
        cancelBtn.onmouseup = () => {
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        };
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            onCancel();
        };

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.style.cssText = `
            padding: 9px 18px;
            border: none;
            border-radius: 6px;
            background-color: #20c997;
            color: white;
            cursor: pointer;
            font-size: 14px;
            line-height: 1.5;
            text-align: center;
            transition: all 0.25s ease;
            font-family: ${baseStyle.font};
            boxShadow: 0 3px 6px rgba(32, 201, 151, 0.3);
        `;
        
        confirmBtn.onmouseover = () => {
            confirmBtn.style.backgroundColor = '#17a974';
            confirmBtn.style.boxShadow = '0 4px 8px rgba(23, 169, 116, 0.4)';
            confirmBtn.style.transform = 'translateY(-1px)';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.backgroundColor = '#20c997';
            confirmBtn.style.boxShadow = '0 3px 6px rgba(32, 201, 151, 0.3)';
            confirmBtn.style.transform = 'translateY(0)';
        };
        confirmBtn.onmousedown = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = '0 2px 4px rgba(32, 201, 151, 0.2)';
        };
        confirmBtn.onmouseup = () => {
            confirmBtn.style.transform = 'translateY(-1px)';
            confirmBtn.style.boxShadow = '0 4px 8px rgba(23, 169, 116, 0.4)';
        };
        confirmBtn.onclick = () => {
            const value = input.value.trim();
            document.body.removeChild(overlay);
            onConfirm(value);
        };

        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        dialog.appendChild(title);
        dialog.appendChild(hint);
        dialog.appendChild(input);
        dialog.appendChild(devInfo);
        dialog.appendChild(buttons);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            dialog.style.transform = 'translateY(0)';
        }, 10);
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        });
    }

    function downFile(blob, fileName) {
        downloadLink.download = fileName;
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    }

    ele.click(function() {
        const defaultFilename = getTimestampFilename();
        
        showFilenameDialog(
            defaultFilename,
            (userInput) => {
                let fileName = userInput || defaultFilename;
                if (!fileName.toLowerCase().endsWith('.xlsx')) fileName += '.xlsx';

                const xhr = new XMLHttpRequest();
                xhr.open("POST", '/jwglxt/cjcx/cjcx_dcXsKccjList.html', true);
                xhr.responseType = 'blob';
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

                const encodedXnm = encodeURIComponent(document.querySelector('#xnm').value);
                const encodedXqm = encodeURIComponent(document.querySelector('#xqm').value);
                const data = `gnmkdmKey=N305005&xnm=${encodedXnm}&xqm=${encodedXqm}&dcclbh=JW_N305005_GLY&exportModel.selectCol=kcmc%40%E8%AF%BE%E7%A8%8B%E5%90%8D%E7%A7%B0&exportModel.selectCol=xnmmc%40%E5%AD%A6%E5%B9%B4&exportModel.selectCol=xqmmc%40%E5%AD%A6%E6%9C%9F&exportModel.selectCol=kkbmmc%40%E5%BC%80%E8%AF%BE%E5%AD%A6%E9%99%A2&exportModel.selectCol=kch%40%E8%AF%BE%E7%A8%8B%E4%BB%A3%E7%A0%81&exportModel.selectCol=jxbmc%40%E6%95%99%E5%AD%A6%E7%8F%AD&exportModel.selectCol=xf%40%E5%AD%A6%E5%88%86&exportModel.selectCol=xmcj%40%E6%88%90%E7%BB%A9&exportModel.selectCol=xmblmc%40%E6%88%90%E7%BB%A9%E5%88%86%E9%A1%B9&exportModel.exportWjgs=xls&fileName=%E6%96%87%E4%BB%B91656485751290`;

                xhr.onload = () => {
                    if (xhr.status === 200) downFile(xhr.response, fileName);
                    else {
                        console.error(`请求失败：${xhr.status}`);
                        alert(`导出失败，状态码：${xhr.status}`);
                    }
                };
                xhr.onerror = () => {
                    console.error("请求错误");
                    alert("导出发生错误");
                };
                xhr.ontimeout = () => {
                    console.error("请求超时");
                    alert("导出超时");
                };
                xhr.timeout = 5000;
                xhr.send(data);
            },
            () => showCancelToast()
        );
    });

    $('body').append(ele);
})();
