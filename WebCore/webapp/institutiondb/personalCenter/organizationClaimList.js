/***机构认领列表***/
define([], function() {
    let pageParas,pageDom,gridDom;
    let dataSource;
    const user = nomapp.context.User;
    if(!user){
        console.log("没有获取到登录用户~");
        return{view:{}};
    }
    let userId = user.Id;
    let getData=function(){
        if(!pageDom){
            pageParas ={pageIndex: 1, pageSize: 10};
        }else{
            pageParas = pageDom.getPageParams();
        }
        let searchParams ={userId:userId,page:pageParas.pageIndex,rows:pageParas.pageSize};
        axios.post('/api/institution-db/org-claims/get-org-claim-list', searchParams)
        .then((res) => {
            dataSource = res&&res.items;
            gridDom.update({ data: dataSource });
            pageDom.update({ totalCount: res&&res.totalItems, pageIndex: res&&res.currentPage });
        })
    };

    let cancelClaim =(id,orgid,callback)=>{
        let searchParams ={userId:userId,orgId:orgid,id:id};
        axios.post('/api/institution-db/org-claims/cancel-org-claim', searchParams)
        .then((res) => {
            callback(res);
        });
    }

    /*更新grid数据*/
    let updateGridData = sdscom.utils.updateGridData;

    return ()=>{
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
                                width: 60,
                                title: "",
                                field: "siteLogo",
                                render: (colData, rowData) => {
                                    return {
                                        tag: 'img',
                                        attrs: {
                                            src: colData || '/Assets/img/jg.png',
                                            style: {
                                                width: "43px",
                                                height: "43px",
                                            }
                                        },
                                    }
                                }
                            },
                            {
                                title: '机构名',
                                field: "studySiteName",
                                span:2,
                                cellRender:function(col){
                                    let rowData= col.rowData;
                                    return {
                                        children:[
                                            {
                                                component: 'Container',
                                                breakpoint: 'xxl',
                                                children:{
                                                    component: 'Cols',
                                                    items: [
                                                        {
                                                            component: 'Button',
                                                            text: col.cellData,
                                                            type:'text',
                                                            attrs:{
                                                                style:'font-weight: 700;font-size: 16px;'
                                                            },
                                                            onClick:function(){
                                                                window.open('#!research/organizedetail/?SiteId=' + rowData.siteOrgId + `&v=${new Date().getTime()}`)
                                                            }
                                                        },
                                                        {
                                                            component: 'Tag',size: 'xs',
                                                            text: rowData&&rowData.codeText,
                                                            color:'yellow',
                                                            attrs:{
                                                                style:(rowData&&rowData.codeText?'':'display:none'),

                                                            }
                                                        },
                                                        {
                                                            component: 'Tag',size: 'xs',
                                                            text: rowData&&rowData.recordNo?'药物备案':'',
                                                            color:'olive',
                                                            attrs:{
                                                                style: (rowData&&rowData.recordNo?'':'display:none'),
                                                            }
                                                        },
                                                        {
                                                            component: 'Tag',size: 'xs',
                                                            text: rowData&&rowData.isPhaseOne?'I期基地':'',
                                                            color:'green',
                                                            attrs:{
                                                                style:(rowData&&rowData.isPhaseOne?'':'display:none'),
                                                            }
                                                        },
                                                        {
                                                            component: 'Tag',size: 'xs',
                                                            text: rowData&&rowData.isInstrument?'机械备案':'',
                                                            color:'teal',
                                                            attrs:{
                                                                style: (rowData&&rowData.isInstrument?'':'display:none'),
                                                            }
                                                        },
                                                    ],
                                                    inline: true,
                                                }
                                            },
                                            {
                                                component: 'Container',
                                                breakpoint: 'xxl',
                                                children:{
                                                    component: 'Button',
                                                    text: (rowData.province||'') +'/'+(rowData.city||''),
                                                    type: 'text',
                                                    icon: 'address',
                                                    attrs:{
                                                        style:'font-size: 12px;font-weight: 400;color:#666666;padding:0;'
                                                    }
                                                }
                                            },                                           
                                        ]
                                    }
                                }
                            },
                            {
                                width: 200,
                                title: '申请认领时间',
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
                                title: '审批状态',
                                field: "status",
                                cellRender:function(col, row){
                                    let cellData = col.cellData == 1?'草稿':col.cellData ==2?'待审批':col.cellData ==3?'审批通过':col.cellData ==4?'未通过':col.cellData ==9?'取消认领':'';
                                    return {
                                        component:'span',
                                        children:cellData,
                                        attrs:{
                                            style:"color:" + (col.cellData == 1?'#999999':col.cellData ==2?'#3da2d0':col.cellData ==3?'#34c856':col.cellData ==4?'#ff6633;':col.cellData ==9?'#999999':'#999999')
                                        }
                                    }
                                }
                            },      
                            {
                                width: 200,
                                title: '操作',
                                field: "operator",
                                render: function(colData, rowData)  {
                                    let that = this;
                                    let cellDom ={};
                                    if(rowData.status==3){
                                        cellDom ={
                                            children:[
                                                {
                                                    component:'Cols',
                                                    items:[
                                                        {
                                                            component:'Button',size: 'small',
                                                            text: '去维护',
                                                            type: 'primary',
                                                            // attrs:{
                                                            //     style:'background-color:rgba(0, 191, 191);border-color:rgba(221, 221, 221, 1);color:white;',
        
                                                            // },
                                                            //href:'#!personalCenter/orgClaimMaintainDefault?siteOrgId='+rowData.siteOrgId
                                                            onClick:()=>{
                                                                location.href = '#!personalCenter/orgClaimMaintainDefault?siteOrgId='+rowData.siteOrgId;
                                                            }
                                                        },
                                                        {
                                                            component:'Button',size: 'small',
                                                            text: '取消认领',
                                                            popconfirm: {
                                                                title: '取消认领',
                                                                content: '您确定要取消认领此机构吗？',
                                                                onConfirm: () => {
                                                                    let key = that.tr.key;                                                          
                                                                    let obj={
                                                                        status:9,                                                     
                                                                    }
                                                                    cancelClaim(rowData.id,rowData.siteOrgId,resHandle);
                                                                    function resHandle(res){
                                                                        if(res){
                                                                            updateGridData('edit',gridDom,key,obj);
                                                                            new nomui.Alert({
                                                                                type: 'success',
                                                                                title: '操作成功',
                                                                                description: '您已取消认领【'+rowData.studySiteName+'】~',
                                                                            });
                                                                        }else{
                                                                            new nomui.Alert({
                                                                                type: 'error',
                                                                                title: '操作错误',
                                                                                description: '',
                                                                            });
                                                                        }
                                                                    }
        
                                                                },
                                                            },
                                                        }
                                                    ]
                                                },
                                        
                                            ]
                                        }
                                    }
                                    return cellDom;
                                }
                            },                           
                        ],
                        _created: function () {
                            getData();
                        }
                    },
                    {
                        component: 'Pager',
                        ref: (c) => {pageDom = c},
                        onPageChange: function () {
                            getData();
                        }
                    }
                ]
            }
        }

    }
});