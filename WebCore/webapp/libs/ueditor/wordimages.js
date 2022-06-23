UE.registerUI('word图片', function (editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function () {
            var images = UE.dom.domUtils.getElementsByTagName(editor.document, "img");
            var imgFiles = [];
            editor.fireEvent('saveScene');

            
            for (var i = 0,img; img = images[i++];) {
                var src = img.getAttribute("word_img");
                if (!src) continue;
                imgFiles.push(new File(src));
                //for (var j = 0,url; url = imageUrls[j++];) {
                //    if (src.indexOf(url.original.replace(" ","")) != -1) {
                //        img.src = urlPrefix + url.url;
                //        img.setAttribute("_src", urlPrefix + url.url);  //同时修改"_src"属性
                //        img.setAttribute("title",url.title);
                //        domUtils.removeAttributes(img, ["word_img","style","width","height"]);
                //        editor.fireEvent("selectionchange");
                //        break;
                //    }
            }
            var data;
            var uploader = uploadFiles('', {
                tenantType: '@CTS.Common.Organizations.MediaTenants._.Independent',
                tenantId: editor.oid,
                folderId: null,
                oid: editor.oid,
                did: 1,
                mediaType: 2,
                isTemp: true,
                allowRepeat: true
            }, function (ar) {
                if (ar.Success) {
                    data = ar.Data;
                }
            }, function (uploader, pop, upOptions) { if (!upOptions.hasInvalid) { pop.close(); popupObj.close(data) } }, {
                pick: { id: 'UploadBtn' },
                accept: {
                    title: 'image',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                }
            });
            uploader.addFiles(imgFiles);
            uploader.upload(imgFiles);
        }
    });
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: uiName,
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position:-660px -40px;',
        //点击时执行的命令
        onclick: function () {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);

          
        }
    });
    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function () {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });
    //因为你是添加button,所以需要返回这个button
    return btn;
});