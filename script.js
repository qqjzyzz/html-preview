document.addEventListener('DOMContentLoaded', function() {
    const htmlEditor = document.getElementById('html-editor');
    const previewArea = document.getElementById('preview-area');
    const downloadBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');
    
    // 初始化编辑器
    htmlEditor.value = '<h1 style="color: #4a90e2;">欢迎使用HTML实时预览工具</h1>\n\n<p>在左侧编辑区域粘贴您的HTML代码，右侧将实时显示效果。</p>\n\n<p>您还可以点击上方的"下载为图片"按钮保存预览效果。</p>\n\n<h2>支持的HTML元素示例：</h2>\n\n<ul>\n  <li>标题 (h1-h6)</li>\n  <li>段落 (p)</li>\n  <li>列表 (ul, ol, li)</li>\n  <li>链接 (a): <a href="#">示例链接</a></li>\n  <li>图片 (img)</li>\n  <li>表格 (table)</li>\n  <li>以及更多...</li>\n</ul>\n\n<p>试试修改这些内容，或者粘贴您自己的HTML代码！</p>';
    
    // 初始化预览
    updatePreview();
    
    // 监听输入变化，实时更新预览
    htmlEditor.addEventListener('input', updatePreview);
    
    // 下载为图片功能
    downloadBtn.addEventListener('click', downloadAsImage);
    
    // 更新预览区域
    function updatePreview() {
        try {
            // 创建一个iframe来隔离HTML内容的样式
            let iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.backgroundColor = 'white';
            
            // 清空预览区域并添加iframe
            previewArea.innerHTML = '';
            previewArea.appendChild(iframe);
            
            // 获取iframe的文档对象
            let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // 创建基本的HTML结构
            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 30px;
                            line-height: 1.5;
                            color: #333;
                            box-sizing: border-box;
                        }
                        * {
                            box-sizing: border-box;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin-top: 0.5em;
                            margin-bottom: 0.5em;
                            line-height: 1.2;
                        }
                        h1 { font-size: 2em; }
                        h2 { font-size: 1.5em; }
                        h3 { font-size: 1.17em; }
                        p { margin-bottom: 1em; }
                        a { color: #4a90e2; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        ul, ol { margin-left: 1.5em; margin-bottom: 1em; }
                        li { margin-bottom: 0.5em; }
                        img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                        pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-bottom: 1em; font-family: monospace; }
                    </style>
                </head>
                <body>${htmlEditor.value}</body>
                </html>
            `);
            iframeDoc.close();
            
            // 处理iframe内部的链接，防止点击跳转
            const links = iframeDoc.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                });
            });
        } catch (error) {
            previewArea.innerHTML = '<p style="color: red; font-weight: bold;">HTML解析错误: ' + error.message + '</p>';
            console.error('HTML解析错误:', error);
        }
    }
    
    // 下载为图片功能
    function downloadAsImage() {
        // 获取选择的格式
        const format = formatSelect.value;
        
        // 显示加载状态
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在生成...';
        downloadBtn.disabled = true;
        
        try {
            // 获取iframe元素
            const iframe = previewArea.querySelector('iframe');
            if (!iframe) {
                throw new Error('预览区域中未找到iframe');
            }
            
            // 获取iframe的文档对象和body元素
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeBody = iframeDoc.body;
            
            // 根据选择的格式执行不同的下载操作
            if (format === 'svg') {
                // 下载为SVG格式
                downloadAsSVG(iframeBody);
            } else if (format === 'html') {
                // 下载为HTML格式
                downloadAsHTML(iframeDoc);
            } else {
                // 下载为PNG或JPG格式
                downloadAsRaster(iframeBody, format);
            }
        } catch (error) {
            alert('生成文件时出错: ' + error.message);
            console.error('生成文件错误:', error);
            
            // 恢复按钮状态
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
            downloadBtn.disabled = false;
        }
    }
    
    // 下载为光栅图像格式(PNG/JPG)
    function downloadAsRaster(contentElement, format) {
        // 创建一个新的iframe，确保与预览完全一致
        const tempIframe = document.createElement('iframe');
        tempIframe.style.position = 'absolute';
        tempIframe.style.left = '-9999px';
        tempIframe.style.width = previewArea.offsetWidth + 'px';
        tempIframe.style.height = previewArea.offsetHeight + 'px';
        tempIframe.style.border = 'none';
        tempIframe.style.backgroundColor = 'white';
        
        // 添加到文档中
        document.body.appendChild(tempIframe);
        
        // 获取临时iframe的文档对象
        const tempIframeDoc = tempIframe.contentDocument || tempIframe.contentWindow.document;
        
        // 复制原始iframe的内容和样式
        tempIframeDoc.open();
        tempIframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 30px;
                        line-height: 1.5;
                        color: #333;
                        box-sizing: border-box;
                        background-color: white;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        margin-top: 0.5em;
                        margin-bottom: 0.5em;
                        line-height: 1.2;
                    }
                    h1 { font-size: 2em; }
                    h2 { font-size: 1.5em; }
                    h3 { font-size: 1.17em; }
                    p { margin-bottom: 1em; }
                    a { color: #4a90e2; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    ul, ol { margin-left: 1.5em; margin-bottom: 1em; }
                    li { margin-bottom: 0.5em; }
                    img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-bottom: 1em; font-family: monospace; }
                </style>
            </head>
            <body>${htmlEditor.value}</body>
            </html>
        `);
        tempIframeDoc.close();
        
        // 等待临时iframe加载完成
        setTimeout(function() {
            const tempIframeBody = tempIframeDoc.body;
            
            // 使用html2canvas捕获临时iframe的body内容
            html2canvas(tempIframeBody, {
                allowTaint: true,
                useCORS: true,
                scale: 2, // 提高图片质量
                backgroundColor: '#ffffff',
                logging: false,
                width: tempIframeBody.scrollWidth,
                height: tempIframeBody.scrollHeight
            }).then(function(canvas) {
                // 创建下载链接
                const link = document.createElement('a');
                const timestamp = new Date().getTime();
                
                // 根据格式设置文件名和MIME类型
                if (format === 'jpg') {
                    link.download = 'html-preview-' + timestamp + '.jpg';
                    link.href = canvas.toDataURL('image/jpeg', 0.9); // JPEG质量设为0.9
                } else {
                    link.download = 'html-preview-' + timestamp + '.png';
                    link.href = canvas.toDataURL('image/png');
                }
                
                link.click();
                
                // 从文档中移除临时iframe
                document.body.removeChild(tempIframe);
                
                // 恢复按钮状态
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
                downloadBtn.disabled = false;
            }).catch(function(error) {
                // 从文档中移除临时iframe
                if (document.body.contains(tempIframe)) {
                    document.body.removeChild(tempIframe);
                }
                
                alert('生成图片时出错: ' + error.message);
                console.error('生成图片错误:', error);
                
                // 恢复按钮状态
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
                downloadBtn.disabled = false;
            });
        }, 200); // 等待200毫秒确保iframe加载完成
    }
    
    // 下载为SVG格式
    function downloadAsSVG(contentElement) {
        try {
            // 创建一个临时容器，添加样式使其更接近期望效果
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = previewArea.offsetWidth + 'px';
            tempContainer.style.padding = '30px';
            tempContainer.style.backgroundColor = '#f5f1e4'; // 米色背景
            
            // 创建内部容器，添加白色背景和圆角
            const innerContainer = document.createElement('div');
            innerContainer.style.backgroundColor = 'white';
            innerContainer.style.borderRadius = '15px';
            innerContainer.style.padding = '40px';
            innerContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            innerContainer.style.textAlign = 'center';
            innerContainer.style.fontFamily = 'Georgia, serif';
            innerContainer.style.color = '#333';
            innerContainer.innerHTML = contentElement.innerHTML;
            
            // 将内部容器添加到临时容器
            tempContainer.appendChild(innerContainer);
            document.body.appendChild(tempContainer);
            
            // 获取内容尺寸
            const width = tempContainer.scrollWidth;
            const height = tempContainer.scrollHeight;
            
            // 使用html2canvas捕获临时容器
            html2canvas(tempContainer, {
                allowTaint: true,
                useCORS: true,
                scale: 2, // 提高图片质量
                backgroundColor: '#f5f1e4', // 确保背景色一致
                logging: false,
                width: width,
                height: height
            }).then(function(canvas) {
                // 将canvas转换为base64图像
                const imgData = canvas.toDataURL('image/png');
                
                // 创建SVG文档，使用图像
                const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" version="1.1">
    <rect width="100%" height="100%" fill="#f5f1e4"/>
    <image width="${width}" height="${height}" xlink:href="${imgData}"/>
</svg>`;
                
                // 创建Blob对象
                const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
                
                // 创建下载链接
                const link = document.createElement('a');
                link.download = 'html-preview-' + new Date().getTime() + '.svg';
                link.href = URL.createObjectURL(blob);
                link.click();
                
                // 清理
                URL.revokeObjectURL(link.href);
                document.body.removeChild(tempContainer);
                
                // 恢复按钮状态
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
                downloadBtn.disabled = false;
            }).catch(function(error) {
                alert('生成SVG时出错: ' + error.message);
                console.error('生成SVG错误:', error);
                
                // 恢复按钮状态
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
                downloadBtn.disabled = false;
                
                // 从文档中移除临时容器
                if (document.body.contains(tempContainer)) {
                    document.body.removeChild(tempContainer);
                }
            });
        } catch (error) {
            alert('生成SVG时出错: ' + error.message);
            console.error('生成SVG错误:', error);
            
            // 恢复按钮状态
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
            downloadBtn.disabled = false;
        }
    }
    
    // 添加下载为HTML格式的函数
    function downloadAsHTML(iframeDoc) {
        try {
            // 获取HTML文档的完整内容
            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML预览</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 30px;
            line-height: 1.5;
            color: #333;
            box-sizing: border-box;
        }
        * {
            box-sizing: border-box;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            line-height: 1.2;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.17em; }
        p { margin-bottom: 1em; }
        a { color: #4a90e2; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul, ol { margin-left: 1.5em; margin-bottom: 1em; }
        li { margin-bottom: 0.5em; }
        img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-bottom: 1em; font-family: monospace; }
    </style>
</head>
<body>${htmlEditor.value}</body>
</html>`;
            
            // 创建Blob对象
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            
            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = 'html-content-' + timestamp + '.html';
            link.href = URL.createObjectURL(blob);
            link.click();
            
            // 清理
            URL.revokeObjectURL(link.href);
            
            // 恢复按钮状态
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
            downloadBtn.disabled = false;
        } catch (error) {
            alert('生成HTML文件时出错: ' + error.message);
            console.error('生成HTML文件错误:', error);
            
            // 恢复按钮状态
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载文件';
            downloadBtn.disabled = false;
        }
    }
    
    // 清理HTML内容，使其适合在SVG中使用
    function sanitizeHTMLForSVG(html) {
        // 创建一个临时的DOM元素来解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 移除所有script标签
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // 移除所有link标签
        const links = doc.querySelectorAll('link');
        links.forEach(link => link.remove());
        
        // 移除所有style标签
        const styles = doc.querySelectorAll('style');
        styles.forEach(style => style.remove());
        
        // 移除所有iframe标签
        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.remove());
        
        // 移除所有form标签
        const forms = doc.querySelectorAll('form');
        forms.forEach(form => form.remove());
        
        // 修复自闭合标签
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        selfClosingTags.forEach(tagName => {
            const tags = doc.querySelectorAll(tagName);
            tags.forEach(tag => {
                // 确保自闭合标签正确闭合
                if (!tag.outerHTML.endsWith('/>')) {
                    const newTag = document.createElement(tagName);
                    // 复制所有属性
                    Array.from(tag.attributes).forEach(attr => {
                        newTag.setAttribute(attr.name, attr.value);
                    });
                    tag.parentNode.replaceChild(newTag, tag);
                }
            });
        });
        
        // 内联样式 - 增强样式处理，确保文本正确显示
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
            // 为所有元素添加默认样式
            if (el.tagName === 'A') {
                el.style.color = '#4a90e2';
                el.style.textDecoration = 'none';
            } else if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || 
                       el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6') {
                el.style.marginTop = '0.5em';
                el.style.marginBottom = '0.5em';
                el.style.lineHeight = '1.2';
                el.style.fontFamily = 'Arial, sans-serif';
            } else if (el.tagName === 'P') {
                el.style.marginBottom = '1em';
                el.style.fontFamily = 'Arial, sans-serif';
            } else if (el.tagName === 'UL' || el.tagName === 'OL') {
                el.style.marginLeft = '1.5em';
                el.style.marginBottom = '1em';
            } else if (el.tagName === 'LI') {
                el.style.marginBottom = '0.5em';
                el.style.fontFamily = 'Arial, sans-serif';
            } else if (el.tagName === 'IMG') {
                el.style.maxWidth = '100%';
                el.style.height = 'auto';
                el.style.display = 'block';
                el.style.margin = '1em 0';
            }
            
            // 确保所有文本元素都有字体设置
            if (el.textContent && el.textContent.trim() !== '') {
                if (!el.style.fontFamily) {
                    el.style.fontFamily = 'Arial, sans-serif';
                }
            }
        });
        
        // 获取body内容并确保所有HTML实体都被正确编码
        return doc.body.innerHTML;
    }
    
    // 添加快捷键支持
    document.addEventListener('keydown', function(e) {
        // Ctrl+S 或 Command+S 触发下载图片
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadAsImage();
        }
    });
}); 