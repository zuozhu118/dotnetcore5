window.Selected_Comment_Ids = [];
UE.registerUI('commentdialog', function (editor, uiName) {
    window.id = 1;
    //创建dialog
    var dialog = new UE.ui.Dialog({
        //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
        iframeUrl: '/Assets/js/ueditor/custom/commentDialog.html',
        //需要指定当前的编辑器实例
        editor: editor,
        //指定dialog的名字
        name: uiName,
        //dialog的标题
        title: "添加批注",

        //指定dialog的外围样式
        cssRules: "width:600px;height:300px;",

        //如果给出了buttons就代表dialog有确定和取消
        buttons: [
            {
                className: 'edui-okbutton',
                label: '确定',
                onclick: function () {
                    var range = editor.selection.getRange();
                    range.createCommentRange(true);
                    dialog.close(true);
                }
            },
            {
                className: 'edui-cancelbutton',
                label: '取消',
                onclick: function () {
                    dialog.close(false);
                }
            }
        ]
    });
    //扩展Range
    UE.dom.Range.prototype.createCommentRange = function (serialize) {
        var endNode,
            startNode = this.document.createElement('span');
        startNode.style.cssText = 'display:none;line-height:0px;';
        var id = window.id++;
        startNode.setAttribute('data-id', 'c'+id);
        startNode.setAttribute('class', 'commentRangeStart');
        startNode.appendChild(this.document.createTextNode('\u200D'));
        startNode.id = 'commentRangeStart' + id;

        if (!this.collapsed) {
            endNode = startNode.cloneNode(true);
            endNode.setAttribute('class', 'commentRangeEnd');
            endNode.id = 'commentRangeEnd' + id;
        }
        this.insertNode(startNode);
        if (endNode) {
            this.collapse().insertNode(endNode).setEndBefore(endNode);
        }
        this.setStartAfter(startNode);
        return {
            start: serialize ? startNode.id : startNode,
            end: endNode ? serialize ? endNode.id : endNode : null,
            id: serialize
        }
    }
    //参考addCustomizeButton.js
    var btn = new UE.ui.Button({
       
        name: 'dialogbutton' + uiName,
        title: 'dialogbutton' + uiName,
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -500px 0;',
        onclick: function () {
            //渲染dialog
            dialog.render();
            dialog.open();
        }
    });
    //当点到编辑内容上时，按钮要做的状态反射
   
    editor.addListener('selectionchange', function () {
        var commentids = [];
        var parents = UE.dom.domUtils.findParents(editor.selection.getStart(), true, null, true);
        parents && UE.utils.each(parents, function (e, i) {
            var commentid = e.getAttribute('data-commentid');
            if (commentid) {
                commentids.push(commentid);
            }

        });
        if (commentids.length > 0) {
            window.Selected_Comment_Ids = commentids;
            utils.event.trigger('project.showCommentSection');
            btn.setDisabled(true);
            btn.setChecked(true);
        } else {
            window.Selected_Comment_Ids = [];
            utils.event.trigger('project.hideCommentSection');
            btn.setDisabled(false);
            btn.setChecked(false);
        }
    });

    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);