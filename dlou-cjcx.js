// ==UserScript==
// @name         大连海洋大学教务系统成绩导出工具
// @namespace    http://www.jiangyishu.cn/#/dlou-cjcx/
// @version      1.0
// @description  用于大连海洋大学正方教务系统V8.0的成绩查询（含平时分）及导出功能
// @author       JiangYishu
// @match        https://jwxt.dlou.edu.cn/jwglxt/cjcx/cjcx_cxDgXscj.html?gnmkdm=N305005&layout=default
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    let ele = $("<button type='button' class='btn btn-default btn_dc' href='javascript:void(0);'><i class='bigger-100 glyphicon glyphicon-export'></i> 导出成绩 </button>");

    ele.css({
        'position': 'fixed',
        'top': '15px',
        'left': '15px',
        'z-index': '9999',
        'background-color': '#dc3545',
        'color': 'white',
        'border': 'none',
        'padding': '8px 16px',
        'border-radius': '4px',
        'cursor': 'pointer',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.2)'
    });

    function showToast(message) {
        const existingToast = document.getElementById('custom-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 99999;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    ele.click(function() {
        const message = "此工具仅适用于大连海洋大学教务系统（正方教务系统V8.0）\n开发者：江易书 邮箱：jiangyishu@189.cn 主页：www.jiangyishu.cn";
        showToast(message);

        function downFile(blob) {
            downloadLink.download = new Date().getTime() + ".xlsx";
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.click();
            URL.revokeObjectURL(downloadLink.href);
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/jwglxt/cjcx/cjcx_dcXsKccjList.html', true);
        xhr.responseType = 'blob';
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        let xnm = encodeURIComponent(document.querySelectorAll('#xnm')[0].value);
        let xqm = encodeURIComponent(document.querySelectorAll('#xqm')[0].value);
        let data = "gnmkdmKey=N305005&xnm=" + xnm + "&xqm=" + xqm + "&dcclbh=JW_N305005_GLY&exportModel.selectCol=kcmc%40%E8%AF%BE%E7%A8%8B%E5%90%8D%E7%A7%B0&exportModel.selectCol=xnmmc%40%E5%AD%A6%E5%B9%B4&exportModel.selectCol=xqmmc%40%E5%AD%A6%E6%9C%9F&exportModel.selectCol=kkbmmc%40%E5%BC%80%E8%AF%BE%E5%AD%A6%E9%99%A2&exportModel.selectCol=kch%40%E8%AF%BE%E7%A8%8B%E4%BB%A3%E7%A0%81&exportModel.selectCol=jxbmc%40%E6%95%99%E5%AD%A6%E7%8F%AD&exportModel.selectCol=xf%40%E5%AD%A6%E5%88%86&exportModel.selectCol=xmcj%40%E6%88%90%E7%BB%A9&exportModel.selectCol=xmblmc%40%E6%88%90%E7%BB%A9%E5%88%86%E9%A1%B9&exportModel.exportWjgs=xls&fileName=%E6%96%87%E4%BB%B91656485751290";

        xhr.onload = function() {
            if (xhr.status === 200) {
                downFile(xhr.response);
            } else {
                console.error("请求失败，状态码：" + xhr.status);
            }
        };

        xhr.onerror = function() {
            console.error("请求发生错误");
        };

        xhr.ontimeout = function() {
            console.error("请求超时");
        };

        xhr.timeout = 5000;
        xhr.send(data);
    });

    $('body').append(ele);
})();
