UE.registerUI('插入图片', function (editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function () {
            alert('execCommand:' + uiName)
        }
    });

    editor.fileIds = [];

    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: uiName,
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -726px -77px;',
        //点击时执行的命令
        onclick: function () {

            //用户社区发帖，要上传图片但是未登陆时提示登陆
            if (editor.userId == "") {
                Popup.tip.warning("请先登录系统！");
                return;
            }
            var param = {
                OrganizationId: editor.oid,
                TenantId: editor.userId,
            };
            new Popup({
                url: '/Common/MediaFile/UploadImage/?' + $.param(param),
                onclose: function (data) {
                    if (data != undefined) {
                        var imgSrc = '';
                        if (data.FilePath) {
                            imgSrc = data.FilePath;
                        }
                        if (data.Id) {
                            editor.fileIds.push(data.Id);
                            imgSrc = "/Common/MediaFile/Image/?id=" + imgSrc;
                        }
                        if (imgSrc) {
                            var html = $.format('<img class="item-hd-img" style="max-width:100%;" src="{0}">', imgSrc);
                            editor.execCommand('inserthtml', html);
                        }
                    }
                }
            });
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
} /*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);