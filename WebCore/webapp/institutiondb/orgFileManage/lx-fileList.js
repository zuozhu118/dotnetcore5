/*立项 文件列表*/
define([], function() {
    let gridDom;

    let previewShowList=['txt','pdf','doc','docx','xls','xlsx','jpg','png','gif']
    const user = nomapp.context.User;
    // if(!user){
    //     console.log("没有获取到登录用户~");
    //     return{view:{}};
    // }
    //let userId = user.Id;
    let that;
    let encryptFile = sdscom.utils.encryptFile;
    let orgId,functionName;
    let fileToken;
    let fileType='';
    let _dom = document.getElementById('row_filedata_tabs');
    //获取文件列表
    let getData=function(){

        //orgId = '526337254121701595';
        axios.get('/api/institution-db/files/get-filelist-org-name?orgId=' + orgId + '&functionName='+functionName)
        .then((res) => {
            _dom.Loading && _dom.Loading.remove();
            fileToken = res && res.fileToken;
            gridDom.update({ data: res && res.attachments });
        });
    };

    function GetQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.href.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }


    return (args)=>{
        orgId = args.route.query.SiteId;
        functionName = GetQueryString('functionName');
        return {
            view:{
                children:[
                    {
                        component: "Grid",
                        ref:(c)=>{
                            gridDom = c;
                        },
                        columns: [
                            {
                                title: '文件名称',
                                render:function(colData, rowData){
                                    let iconStr='';
                                    switch(rowData.extImg){
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
                                            //if(rowData.extImg =='xlsx') fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                            break;
                                        case 'rar':
                                        case 'zip':
                                        case '7z':
                                            iconStr = 'winrar';
                                            if(rowData.extImg =='zip') fileType = 'application/zip';
                                            if(rowData.extImg =='rar') fileType = 'application/octet-stream';
                                            break;
                                        case 'pdf':
                                            iconStr= 'pdf-blue';
                                            fileType ='application/pdf';
                                            break;   
                                        case 'jpg':
                                            iconStr = 'jpg-blue';
                                            fileType = 'image/jpeg';
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

                                        children:{
                                            component:'Cols',
                                            items:[
                                                {
                                                    component:'Button',
                                                    icon:iconStr,
                                                    type: 'text',
                                                    text:rowData.fileDisplayNameWithExt
                                                },
                                                // {
                                                //     component:'StaticText',
                                                //     value:rowData.fileDisplayNameWithExt
                                                // }
                                            ]
                                        }
                                    }
                                }
                            },    
                            {
                                width: 200,
                                title: '时间',
                                field: "createdTime",
                                cellRender:function(col){
                                    let cellData = nomui.utils.formatDate(col.cellData,'yyyy/MM/dd');
                                    return {
                                        component:'span',
                                        children:cellData
                                    }
                                }
                            },
                            {
                                width: 200,
                                title: '操作',
                                field: "operator",
                                render: function(colData, rowData)  {
                                    let cellDom ={
                                        component:'Cols',
                                        items:[
                                            {   
                                                component:'Button',text:'预览',type:'primary',size: 'small',
                                                onClick:function(){
                                                    //oid 当前机构id， id 文件id
                                                    let tokenJosn = {oid: orgId, id: rowData.fileId,isFromOid:'true',per:fileToken.per};
                                                    let token =encryptFile(tokenJosn);
                                                    let url = window.location.origin +'/Common/MediaFile/PreviewOld?token='+token;
                                                    //window.open(url);
                                                    let link = document.createElement('a');
                                                    link.setAttribute('href',url);
                                                    link.setAttribute('target','_blank');
                                                    link.click();
                                                }
                                            },
                                            {
                                                component:'Button',text:'下载',type:'primary',size: 'small',
                                                onClick:function(){
                                                    let tokenJosn = {oid: orgId, id: rowData.fileId,isFromOid:'true',per:fileToken.per};
                                                    let token =encryptFile(tokenJosn);
                                                    let url = window.location.origin +'/Common/MediaFile/Download?token='+token;

                                                    axios.get(url,{responseType: 'arraybuffer'}).then(res=>{
                                                        if (!res) {
                                                            console.log('无法获取到文件流');
                                                            return;
                                                        };
                                                        var blob = new Blob([res], {type: fileType});
                                                        var objectUrl = URL.createObjectURL(blob);
                                                        var a = document.createElement('a');
                                                        //document.body.appendChild(a);
                                                        a.setAttribute('style', 'display:none');
                                                        a.setAttribute('href', objectUrl);
                                                        var filename= rowData.fileDisplayNameWithExt;
                                                        a.setAttribute('download', filename);
                                                        a.click();
                                                        URL.revokeObjectURL(blob);
                                                    });

                                                    return;
                                                }
                                            }
                                        ]
                                    }

                                    return cellDom;
                                }
                            },                           
                        ],
                        _created: function () {
                            if(gridDom.firstRender){
                                getData();
                            }
                        }
                    },
                    {
                        _created:function(){
                            _dom.Loading = new nomui.Loading({
                                container: _dom,
                                backdrop:true,
                            })
                            

                        }
                    }
                    // {
                    //     component: 'Pager',
                    //     ref: (c) => {pageDom = c},
                    //     onPageChange: function () {
                    //         getData();
                    //     }
                    // }
                ]
            },
            
        }
    }
   
});