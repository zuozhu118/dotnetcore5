window.CommentLayer_Exist = false;
UE.registerUI('commentbtn', function (editor, uiName) {
  
    window.id = 0;
    var commentRange = null;
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function () {
            command();
        }
    });

  
    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: '新建批注',
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -756px 43px;',
        //点击时执行的命令
        onclick: function () {
            //这里可以不用执行命令,做你自己的操作也可
            // editor.execCommand(uiName);
            command();
        }
    });
    

    function command() {
        var range = editor.selection.getRange();
        range.select();
        var text = editor.selection.getText();
        if (text) {
            commentRange = range.createCommentRange();
            var comment = {
                Id: 'new' + window.id,
                quote: text
            };
            utils.event.trigger('project.showCommentSection', comment);
            utils.event.onSingle('project.undoComment', function (data) {
                range.moveToCommentRange(commentRange);
            });

          
            btn.setDisabled(true);
            btn.setChecked(true);
        }

    }
    utils.event.onSingle('project.enableBtn', function (data) {
       
        btn.setDisabled(false);
        btn.setChecked(false);
    });


    //扩展Range
    UE.dom.Range.prototype.createCommentRange = function () {
        var endNode,
            startNode = this.document.createElement('span');
      //  startNode.style.cssText = 'display:none;line-height:0px;';
        var id = ++window.id;
        startNode.setAttribute('data-id', 'new' + id);
        startNode.setAttribute('class', 'commentRangeStart');
        startNode.appendChild(this.document.createTextNode('\u200D'));
        if (!this.collapsed) {
            endNode = startNode.cloneNode(true);
            endNode.setAttribute('class', 'commentRangeEnd');
        }
        this.insertNode(startNode);
        if (endNode) {
            this.collapse().insertNode(endNode).setEndBefore(endNode);
        }
        this.setStartAfter(startNode);
        return {
            start:  startNode,
            end: endNode
        }
    }

    UE.dom.Range.prototype.moveToCommentRange = function (commentRange) {
        var start = commentRange.start,
            end = commentRange.end;
        this.setStartBefore(start);
        UE.dom.domUtils.remove(start);
        if (end) {
            this.setEndBefore(end);
            UE.dom.domUtils.remove(end);
        } else {
            this.collapse(true);
        }
        return this;
    },
    
    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function () {
        var comment = null;
 
        var comentTarge = null;
        var parents = UE.dom.domUtils.findParents(editor.selection.getStart(), true, null, true);

        parents && UE.utils.each(parents, function (e, i) {
            var commentid = e.getAttribute('data-commentid') || -1;
            if (commentid !== -1) {
                comentTarge = e;
                var quote = '';
                var content = editor.getContent();
                var doc = document.createElement('div');
                doc.innerHTML = content; 
                var textElements = doc.querySelectorAll('span[data-commentid="' + commentid + '"]');
                UE.utils.each(textElements, function (e, i) {
                    quote += e.innerHTML;
                });

                comment = {
                    Id: commentid,
                    quote: quote
                };
                return false;
            }

        });

        if (comment) {
           
            utils.event.trigger('project.showCommentSection', comment);

            utils.event.onSingle('project.newComment', function () { 
                if (!/new\d+/.test(comment.Id)) {
                    //UE.dom.domUtils.setAttributes(comentTarge, { 'data-commentid': comment.Id + ',new' + (++window.id) })
                    var commentRangeStart = null;
                    var parents = UE.dom.domUtils.findParents(comentTarge, true, null, true);
                    var newid = ++window.id;
                    var content = editor.getContent();
                    var doc = document.createElement('div');
                    doc.innerHTML = content; 

                    var starts = doc.getElementsByClassName('commentRangeStart'); 

                    UE.utils.each(starts, function (e, i) {
                        var commentid = e.getAttribute('data-id') || -1;
                        if (commentid !== -1) {
                            if (commentid == comment.Id) {
                                UE.dom.domUtils.setAttributes(e, { 'data-id': comment.Id + ',new' + newid });
                            }
                        }
                    });
                    
                    var ends = doc.getElementsByClassName('commentRangeEnd');

                    UE.utils.each(ends, function (e, i) {
                        var commentid = e.getAttribute('data-id') || -1;
                        if (commentid !== -1) {
                            if (commentid == comment.Id) {
                                UE.dom.domUtils.setAttributes(e, { 'data-id': comment.Id + ',new' + newid });
                            }
                        }
                    });

                    editor.setContent(doc.innerHTML);
                    ////search commentRangeStart
                    //parents && UE.utils.each(parents, function (e, i) {

                    //    var p = e.previousSibling;
                    //    if (!p) return;
                    //    while (p.nodeType != 1) {
                    //        p = p.previousSibling;
                    //        if (!p) break;
                    //    }
                    //    if (!p) return;

                    //    if (p && UE.dom.domUtils.hasClass(p, 'commentRangeStart')) {
                    //        UE.dom.domUtils.setAttributes(p, { 'data-id': comment.Id + ',new' + newid });
                    //        console.log(p);
                    //        return false;
                    //    }

                      

                    //});

                    ////search commentRangeEnd
                    //parents && UE.utils.each(parents, function (e, i) {

                    //    var n = e.nextSibling;
                    //    if (!n) return;
                    //    while (n.nodeType != 1) {
                    //        n = n.nextSibling;
                    //        if (!n) break;
                    //    }
                    //    if (!n) return;

                    //    if (n && UE.dom.domUtils.hasClass(n, 'commentRangeEnd')) {
                    //        UE.dom.domUtils.setAttributes(n, { 'data-id': comment.Id + ',new' + newid });
                    //        console.log(n);
                    //        return false;
                    //    }
                    //});
                }
            });
 
            btn.setDisabled(true);
            btn.setChecked(true);
        } else {
            utils.event.trigger('project.hideCommentSection');
            //如果是新建就撤销
            utils.event.trigger('project.undoComment');
            
            utils.event.trigger('project.hideWebCommentSection');
        }
    });
 

    //因为你是添加button,所以需要返回这个button
  
    return btn;
});



// 修复自动保存配置项不起作用问题
UE.plugin.register('autosave', function () {

    var me = this,
        //无限循环保护
        lastSaveTime = new Date(),
        //最小保存间隔时间
        MIN_TIME = 20,
        //auto save key
        saveKey = null;

    function save(editor) {

        var saveData;

        if (new Date() - lastSaveTime < MIN_TIME) {
            return;
        }

        if (!editor.hasContents()) {
            //这里不能调用命令来删除， 会造成事件死循环
            saveKey && me.removePreferences(saveKey);
            return;
        }

        lastSaveTime = new Date();

        editor._saveFlag = null;

        saveData = me.body.innerHTML;

        if (editor.fireEvent("beforeautosave", {
            content: saveData
        }) === false) {
            return;
        }

        me.setPreferences(saveKey, saveData);

        editor.fireEvent("afterautosave", {
            content: saveData
        });

    }

    return {
        defaultOptions: {
            //默认间隔时间
            saveInterval: 500,
            enableAutoSave: true
        },
        bindEvents: {
            'ready': function () {

                var _suffix = "-drafts-data",
                    key = null;

                if (me.key) {
                    key = me.key + _suffix;
                } else {
                    key = (me.container.parentNode.id || 'ue-common') + _suffix;
                }

                //页面地址+编辑器ID 保持唯一
                saveKey = (location.protocol + location.host + location.pathname).replace(/[.:\/]/g, '_') + key;

            },

            'contentchange': function () {

                if (!me.getOpt('enableAutoSave')) {
                    return;
                }

                if (!saveKey) {
                    return;
                }

                if (me._saveFlag) {
                    window.clearTimeout(me._saveFlag);
                }

                if (me.options.saveInterval > 0) {

                    me._saveFlag = window.setTimeout(function () {

                        save(me);

                    }, me.options.saveInterval);

                } else {

                    save(me);

                }


            }
        },
        commands: {
            'clearlocaldata': {
                execCommand: function (cmd, name) {
                    if (saveKey && me.getPreferences(saveKey)) {
                        me.removePreferences(saveKey)
                    }
                },
                notNeedUndo: true,
                ignoreContentChange: true
            },

            'getlocaldata': {
                execCommand: function (cmd, name) {
                    return saveKey ? me.getPreferences(saveKey) || '' : '';
                },
                notNeedUndo: true,
                ignoreContentChange: true
            },

            'drafts': {
                execCommand: function (cmd, name) {
                    if (saveKey) {
                        me.body.innerHTML = me.getPreferences(saveKey) || '<p>' + domUtils.fillHtml + '</p>';
                        me.focus(true);
                    }
                },
                queryCommandState: function () {
                    return saveKey ? (me.getPreferences(saveKey) === null ? -1 : 0) : -1;
                },
                notNeedUndo: true,
                ignoreContentChange: true
            }
        }
    }

});

//focus时不触发selectionchange
UE.Editor.prototype.focus = function (toEnd) {
    try {
        var me = this,
            rng = me.selection.getRange();
        if (toEnd) {
            var node = me.body.lastChild;
            if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
                if (domUtils.isEmptyBlock(node)) {
                    rng.setStartAtFirst(node)
                } else {
                    rng.setStartAtLast(node)
                }
                rng.collapse(true);
            }
            rng.setCursor(true);
        } else {
            if (!rng.collapsed && domUtils.isBody(rng.startContainer) && rng.startOffset == 0) {

                var node = me.body.firstChild;
                if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
                    rng.setStartAtFirst(node).collapse(true);
                }
            }

            rng.select(true);

        }
        this.fireEvent('focus selectionchange0');
    } catch (e) {
    }

}