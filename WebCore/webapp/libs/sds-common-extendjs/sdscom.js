(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.sdscom = {}));
}(this, (function (exports) { 'use strict';

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    updateGridData: updateGridData,
    isPCorMob:isPCorMob,
    getTabView:getTabView,
    encryptFile:encryptFile,
    getFileDataGridDom:getFileDataGridDom,
    getFileDataDeployGridDom:getFileDataDeployGridDom
});


/*更新grid表格数据
* gridDom grid对象
* key 更新数据行的key
* newData 更新的json数据
*/
function updateGridData(handtype,gridDom,key,newData){
    let data = gridDom.props.data;
    if(handtype == 'edit'){
        let row =-1;
        for(let item in gridDom.rowsRefs){
            row++;
            if(item == key){
                break;
            }
        }
        if(row<0){
            console.log('获取行号失败~');
            return;
        }
        for(let jKey in newData){
            data[row][jKey] =newData[jKey];
        }
    }else if (handtype == 'add'){
        data.push(newData);
    }

    gridDom.update({ data: data });
}

function isPCorMob(){
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return 'mobile';
    }
    else {
        return 'pc';
    }
}

/*获取tabs*/
function getTabView(tabparas,callback){
    let _tabs =[];
    for(let i=0,len=tabparas.length;i<len;i++){
        _tabs.push({
            key:tabparas[i].key,
            item: { text: tabparas[i].text },
            panel: {
                children:{
                    tagetUrl:tabparas[i].url,
                    tagetParas:tabparas[i].data,
                    ref:(c)=>{_tabObj[tabparas[i].key]=c;},     
                }
                // tagetUrl:tabparas[i].url,
                // tagetParas:tabparas[i].data,
                // ref:(c)=>{_tabObj[tabparas[i].key]=c;},   
            },
        })
    }
    let _tabObj={};
    let _tabDom;
    
    let _dom = {
        component: 'Tabs',
        ref:(c)=>{_tabDom=c;},
        uistyle: 'pill',
        onTabSelectionChange: (args) => {

          callback(args.key,args.sender.getTabContent().getPanel(args.key));
          //callback(args.key,_tabObj[args.key]);
        },
        tabs:_tabs,
        _rendered:function(){
            if(_tabDom.firstRender){
                let _firstTab =  _tabObj[_tabDom.getSelectedTab().key];
                const name = _firstTab.props.tagetParas.functionName
                const url = _firstTab.props.tagetUrl
                _firstTab && _firstTab.parent.update({children:{
                    component: "Router",
                    defaultPath:url,
                }});       
                nomapp.currentRoute.push({
                query:{
                    ...this.$route.query,
                    functionName:name
                }});

            }
   
                
  
        }

    };
    return _dom;    
}

function encryptFile (content) {
    if ($.type(content) === 'object') {
        content = JSON.stringify(content);
    }
    return encodeURIComponent(RSAEncrypt.encryptSection(content));
};

function getFileDataGridDom(paras,callback,previewCallback,downCallback){
    let iconStr,fileType;
    let _grid=                                                        {
        component: "Grid",
        functionName:paras.functionName,
        showTitleCount:paras.showTitleCount,
        columns: [
            {
                title: '文件名称',
                render: function (colData, rowData) {
                    switch (rowData.extImg) {
                        case 'txt':
                            iconStr = 'textDoc';
                            fileType = 'text/html';
                            break;
                        case 'doc':
                        case 'docx':
                            iconStr = 'wordDoc';
                            fileType = 'application/msword';
                            break;
                        case 'xls':
                        case 'xlsx':
                        case 'csv':
                            iconStr = 'excelDoc';
                            fileType = 'application/vnd.ms-excel';
                            break;
                        case 'rar':
                        case 'zip':
                        case '7z':
                            iconStr = 'winrar';
                            if(rowData.extImg =='zip') fileType = 'application/zip';
                            if(rowData.extImg =='rar') fileType = 'application/octet-stream';
                            break;
                        case 'pdf':
                            iconStr = 'pdf-blue';
                            break;
                        case 'jpg':
                            iconStr = 'jpg-blue';
                            fileType ='application/pdf';
                            break;
                        case 'png':
                            iconStr = 'png-blue';
                            fileType = 'image/jpeg';
                            break;
                        case "ppt":
                        case "pptx":
                            fileType = 'application/vnd.ms-powerpoint';
                            break;
                        case "mov":
                        case "flv":
                        case "mp4":
                        case "wmv":
                        case "avi":
                        case "mpeg":
                        case "webm":
                        case "ogv":
                            break;
                        case "mp3":
                            break;
                        case "htm":
                        case "html":
                            break;

                    }
                    return {

                        children: {
                            component: 'Cols',
                            items: [
                                {
                                    component: 'Button',
                                    icon: iconStr,
                                    type: 'text',
                                    text: rowData.fileDisplayNameWithExt
                                },
                            ]
                        }
                    }
                }
            },
            {
                width: 200,
                title: '时间',
                field: "createdTime",
                cellRender: function (col) {
                    let cellData = nomui.utils.formatDate(col.cellData, 'yyyy/MM/dd');
                    return {
                        component: 'span',
                        children: cellData
                    }
                }
            },
            {
                width: 200,
                title: '操作',
                field: "operator",
                render: function (colData, rowData) {
                    let cellDom = {
                        component: 'Cols',
                        items: [
                            {
                                component: 'Button', text: '预览', type: 'primary', size: 'small',
                                onClick: function () {
                                    let tokenJosn = { id: rowData.fileId};
                                    previewCallback(tokenJosn);
                                }
                            },
                            {
                                component: 'Button', text: '下载', type: 'primary', size: 'small',
                                onClick: function () {
                                    let tokenJosn = { id: rowData.fileId};
                                    downCallback(tokenJosn,rowData.fileDisplayNameWithExt,fileType)
                                }
                            }
                        ]
                    }

                    return cellDom;
                }
            },
        ],
        _created:function(){
            if(this.firstRender){
                callback(this);
            }
        }
    };
    return _grid;
}

/**
 * 获取可扩展的grid表格
 * @param {*} data  数据源
 * @returns 
 */    
function getFileDataDeployGridDom(data,isDisable,titleId,previewCallback,downCallback){
    let gridData = [];
    let isHide =false;
    if(!isDisable){
        let titleDom = document.getElementById(titleId);
        titleDom.style.display = "";
        if(data){
            let totalCount =0;
            for(let i=0,len = data.length;i<len;i++){
                let rowTotalCount = 0;
                let rowData ={};
                rowData.children=[];
                rowData.id = i+'';
                if(data[i].orgTmpCategorys){
                    let comRowNumber =0;
                    for(let j=0;j<data[i].orgTmpCategorys.length;j++){
                        // if(data[i].orgTmpCategorys[j].isDisable){
                        //     isHide = data[i].orgTmpCategorys[j].isDisable;
                        //     continue;
                        // }
                        let stepDtos = data[i].orgTmpCategorys[j].orgTmpStepDtos;
                        if(stepDtos){                        
                            for(let z =0;z<stepDtos.length;z++){
                                //步骤，如果是最后一层 且 没有步骤
                                if(!stepDtos[z].stepId && stepDtos[z].isLastLevel){                               
                                    let annexDtos = stepDtos[z].orgTmpAnnexDtos;
                                    if(annexDtos){
                                        for(let ii = 0;ii < annexDtos.length;ii++){
                                            let row_child_1={};
                                            row_child_1.id = i  + '.' + comRowNumber++;
                                            row_child_1.class = annexDtos[ii].annexName;
                                            row_child_1.children=[];                                       
                                            let attachments = annexDtos[ii].attachments;
                                            let atttachCount = 0;
                                            if(attachments){
                                                atttachCount = attachments.length;
                                                for(let iii =0;iii<attachments.length;iii++){
                                                    let row_last={};
                                                    row_last.id = row_child_1.id + '.' + iii;
                                                    //let fileTypeObj = getFileMimeTypeAndIcon(attachments[iii].extImg);
                                                    let attachRow = getAttachRowDom(attachments[iii],previewCallback,downCallback);
                                                    row_last.class = attachRow && attachRow.class;
                                                    row_last.updatedTime = attachRow && attachRow.updatedTime;
                                                    row_last.operator = attachRow && attachRow.operator;
                                                    row_child_1.children.push(row_last);
                                                }
                                                rowTotalCount += atttachCount;
                                            }
                                            row_child_1.class = annexDtos[ii].annexName +   (atttachCount>0?'  (' + atttachCount + ')':'');
                                            rowData.children.push(row_child_1);
                                        }
                                    }
                                }
                                //有一个和多个层级步骤
                                else{                              
                                    let rowNumber = i + '.' + comRowNumber++;
                                    let stepRow={};
                                    stepRow.currentCount=0;
                                    stepRow.parentCount=0;
                                    stepLevelhandle(stepDtos[z],stepRow,rowNumber,0,previewCallback,downCallback);
                                    rowData.children.push(stepRow);
                                    rowTotalCount += stepRow.parentCount;
                                }

                            }                        
                        }
                    }
                }
                rowData.class = {component:'Button',type:'text',icon:'folder',
                    text:data[i].tmpTypeName + (rowTotalCount>0?'  (' +rowTotalCount+')':'')
                }; 
                gridData.push(rowData);
                totalCount += rowTotalCount;
            }
            if(!isHide && titleDom && totalCount>0) titleDom.innerText = titleDom.innerText + ' (' + totalCount + ')';
        }
    }
    let gird = {
        children: [
          {
            component: 'Grid',
            treeConfig: {
              treeNodeColumn: 'class',
              initExpandLevel: 0,
              indicator: {
                expandable: {
                  expandedProps: {
                    type: 'minus-square',
                  },
                  collapsedProps: {
                    type: 'plus-square',
                  },
                },
              },
            },
            columns: [
              {
                field: 'class',
                title: '文件名称',
              },
              {
                field: 'updatedTime',
                title: '更新时间',
                width: 200,
              },
              {
                field:'operator',
                title: '操作',
                width: 200,
              },
            ],
            data: gridData
          },
        ],
    };
    return gird;
}


/**
 * 步骤多层菜单处理
 * @param {*} stepDto 
 * @param {*} stepRow 
 * @param {*} rowNumber 层级id -> 1.0->1.1->1.1.0
 * @param {*} level 层级
 */
function stepLevelhandle(stepDto,stepRow,rowNumber,level,previewCallback,downCallback){
    if(stepDto.isLastLevel){
        let annexDtos = stepDto.orgTmpAnnexDtos;
        stepRow.id = rowNumber + (level>0?'.'+level:'');
        // stepRow.class = stepDto.stepName;
        stepRow.children=[];
        if(annexDtos){
            for(let i = 0;i < annexDtos.length;i++){
                let annexRow={};
                annexRow.id = stepRow.id + '.' + i;
                annexRow.children =[];
                let attachments = annexDtos[i].attachments;
                stepRow.currentCount = 0;
                if(attachments){
                    stepRow.currentCount = attachments.length;
                    for(let ii =0;ii<attachments.length;ii++){
                        let attachRow={};
                        attachRow.id = annexRow.id + '.' + ii ;
                        // attachRow.class = attachments[ii].fileDisplayNameWithExt;
                        // attachRow.updatedTime = attachments[ii].updatedTime;

                        let attachRowObj = getAttachRowDom(attachments[ii],previewCallback,downCallback);
                        attachRow.class = attachRowObj && attachRowObj.class;
                        attachRow.updatedTime = attachRowObj && attachRowObj.updatedTime;
                        attachRow.operator = attachRowObj && attachRowObj.operator;

                        annexRow.children.push(attachRow);
                    }
                    stepRow.parentCount += stepRow.currentCount; 
                }
                annexRow.class = annexDtos[i].annexName + (stepRow.currentCount>0?'  (' + stepRow.currentCount + ')':'');
                stepRow.children.push(annexRow);
            }
            stepRow.class = stepDto.stepName + (stepRow.parentCount>0?'  (' + stepRow.parentCount + ')':'');
        }
        return;

    }else{
        stepRow.id = rowNumber + (level>0?'.'+level:'');

        stepRow.children=[];
        let stepDtos = stepDto.orgTmpStepDtos;
        if(stepDtos){
            let stepCount = 0;
            for(let i=0;i<stepDtos.length;i++){
                let nextLevel = level + 1;
                let nextStepRow={};
                nextStepRow.currentCount=0;
                nextStepRow.parentCount=0;
                let nextRowNumber = stepRow.id + '.' + i;
                stepLevelhandle(stepDtos[i],nextStepRow,nextRowNumber,nextLevel,previewCallback,downCallback);
                stepRow.children.push(nextStepRow);
                stepCount += nextStepRow.parentCount;
            }
            stepRow.parentCount += stepCount;
        }
        stepRow.class = stepDto.stepName + (stepRow.parentCount>0?'  (' + stepRow.parentCount + ')':'');
    }
}

/**
 * 获取文件的mimetype 和 图标
 * @returns 
 */
function getFileMimeTypeAndIcon(fileType){
    let obj={};
    switch (fileType) {
        case 'txt':
            obj.iconStr = 'textDoc';
            obj.mimeType = 'text/html';
            break;
        case 'doc':
        case 'docx':
            obj.iconStr = 'wordDoc';
            obj.mimeType = 'application/msword';
            break;
        case 'xls':
        case 'xlsx':
        case 'csv':
            obj.iconStr = 'excelDoc';
            obj.mimeType = 'application/vnd.ms-excel';
            break;
        case 'rar':
        case 'zip':
        case '7z':
            obj.iconStr = 'winrar';
            if(fileType =='zip') obj.mimeType = 'application/zip';
            if(fileType =='rar') obj.mimeType = 'application/octet-stream';
            break;
        case 'pdf':
            obj.iconStr = 'pdf-blue';
            obj.mimeType ='application/pdf';
            break;
        case 'jpg':
            obj.iconStr = 'jpg-blue';
            obj.mimeType ='application/pdf';
            break;
        case 'png':
            obj.iconStr = 'png-blue';
            obj.mimeType = 'image/jpeg';
            break;
        case "ppt":
        case "pptx":
            obj.mimeType = 'application/vnd.ms-powerpoint';
            break;
        case "mov":
        case "flv":
        case "mp4":
        case "wmv":
        case "avi":
        case "mpeg":
        case "webm":
        case "ogv":
            break;
        case "mp3":
            break;
        case "htm":
        case "html":
            break;
        default:
            obj.iconStr ='defaultFile';
            break;

    }

    return obj;
}

/**
 * 创建文件行 html对象
 * @param {*} attachment 文件数据
 * @param {*} previewCallback 
 * @param {*} downCallback 
 * @returns 
 */
function getAttachRowDom(attachment,previewCallback,downCallback){
    let fileTypeObj = getFileMimeTypeAndIcon(attachment.extImg);
    return {
        class : {
            component: 'Button',
            icon: fileTypeObj.iconStr,
            type: 'text',
            text: attachment.fileDisplayNameWithExt,
            onClick:function(){
                // let tokenJosn = { id: attachment.fileId, isFromOid: 'true'};
                let tokenJosn = { id: attachment.fileId};
                previewCallback(tokenJosn);
            }
        },
        updatedTime : nomui.utils.formatDate(attachment.updatedTime, 'yyyy/MM/dd'),
        operator:{
            children:{
                component: 'Cols',
                items: [
                    {
                        component: 'Button', text: '预览', type: 'primary', size: 'small',
                        onClick: function () {
                            let tokenJosn = { id: attachment.fileId};
                            previewCallback(tokenJosn);
                        }
                    },
                    {
                        component: 'Button', text: '下载', type: 'primary', size: 'small',
                        onClick: function () {
                            let tokenJosn = { id: attachment.fileId};
                            downCallback(tokenJosn,attachment.fileDisplayNameWithExt,fileTypeObj.mimeType)
                        }
                    }
                ]
            }
        }

    };
}


exports.utils = utils;
})))


