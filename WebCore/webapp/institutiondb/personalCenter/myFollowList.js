/***机构关注列表***/
define([], function() {
    let pageParas,pageDom,gridDom;
    let pageDom1,gridDom1;
    let dataSource;
    const user = nomapp.context.User;

    if(!user){
        console.log("没有获取到登录用户~");
        return{view:{}};
    }
    let userId = user.Id;
    //获取关注机构
    let getData=function(){
        if(!pageDom){
            pageParas ={pageIndex: 1, pageSize: 10};
        }else{
            pageParas = pageDom.getPageParams();
        }
        let searchParams ={userId:userId,page:pageParas.pageIndex,rows:pageParas.pageSize};
        axios.post('/api/institution-db/org-attentions/get-myfollow-list', searchParams)
        .then((res) => {
            dataSource = res&&res.items;
            gridDom.update({ data: dataSource });
            pageDom.update({ totalCount: res&&res.totalItems, pageIndex: res&&res.currentPage });
        });
    };

    //获取关注研究者
    let getAttentionData = function(dom){
        let pAttenParas;
        if(!dom){
            pAttenParas ={pageIndex: 1, pageSize: 10};
        }else{
            pAttenParas = dom.getPageParams();
        }
        let searchParams ={userId:userId,page:pAttenParas.pageIndex,rows:pAttenParas.pageSize};
        axios.post('/api/institution-db/org-attentions/get-userattention-list', searchParams)
        .then((res) => {
            gridDom1.update({ data: res&&res.items });
            pageDom1.update({ totalCount: res&&res.totalItems, pageIndex: res&&res.currentPage });
        });
    }

    //取消收藏机构
    let cancelFollow =(id,orgid,callback)=>{
        let searchParams ={userId:userId,siteId:orgid,id:id};
        axios.post('/api/institution-db/org-attentions/org-addorcancel-follow', searchParams)
        .then((res) => {
            callback(res,getData);
        });
    }

    //取消关注研究员
    let cancelAttention_user = (id,callback)=>{
        axios.get('/api/institution-db/org-attentions/user-cancel-attention?id='+id)
        .then((res) => {
            callback(res,getAttentionData);
        });
    }

    /***提交后操作**/
    function resHandle(res,callback){
        if(res){
            callback();           
            // new nomui.Alert({
            //     type: 'success',
            //     title: '操作成功',
            //     description: '您已取消关注了~',
            // });
            new nomui.Message({
                content: '取关成功',
                type: 'success'
            });
        }else{
            new nomui.Alert({
                type: 'error',
                title: '操作错误',
                description: '请联系系统管理员~',
            });
        }
    }


    return ()=>{
        return {
            view:
            {
                component: 'Tabs',uistyle:'pill',
                ref: (c) => {
                tabs = c
                },
                tabs: [
                    {
                        item: {text:'关注机构'},
                        panel: {
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
                                                                        // attrs:{
                                                                        //     style:'background-color:#eeb328;border-color:#eeb328;height:25px;color: #fff;font-weight: 400;font-size: 13px;' + (rowData&&rowData.codeText?'':'display:none'),
            
                                                                        // }
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
                                                                            style: (rowData&&rowData.isPhaseOne?'':'display:none'),
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
                                            title: '操作',
                                            field: "operator",
                                            render: function(colData, rowData)  {
                                                let iconstr = 'love-nomal';
                                                if(rowData.status==1){
                                                    iconstr = 'love-blue';
                                                }
                                                let cellDom ={
                                                    component:'Button',
                                                    icon:iconstr,
                                                    tooltip: '取消关注',
                                                    type:'text',
                                                    onClick:function(){
                                                        cancelFollow(rowData.id,rowData.siteOrgId,resHandle);
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
                    },
                    {
                        item: {text:'关注研究者'},
                        panel: {
                            children:[
                                {
                                    component: "Grid",
                                    ref:(c)=>{
                                        gridDom1 = c;
                                    },
                                    columns: [
                                        {
                                            title: '研究者',
                                            field: "name",
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
                                                                        text: rowData&&rowData.name,
                                                                        type:'text',
                                                                        attrs:{
                                                                            style:'font-weight: 700;font-size: 16px;'
                                                                        },
                                                                        onClick:function(){
                                                                            window.open('#!research/resdetail/?SiteId=' + rowData.siteId + '&PIId=' + rowData.tenantId)
                                                                        }
                                                                    },
                                                                    {
                                                                        component: 'Tag',size: 'xs',
                                                                        text: rowData&&rowData.position,
                                                                        color:'yellow',
                                                                        attrs:{
                                                                            style:(rowData&&rowData.position?'':'display:none'),
            
                                                                        }
                                                                    },
                                                                    {
                                                                        component: 'Tag',size: 'xs',
                                                                        color:'olive',
                                                                        text: rowData&&rowData.isRecorded?'已备案':'未备案',
                                                                        attrs:{
                                                                            style:(rowData&&rowData.isRecorded?'':'display:none'),
                                                                        }
                                                                    }
                                                                ],
                                                                inline: true,
                                                            }
                                                        },
                                                        {
                                                            component: 'Container',
                                                            breakpoint: 'xxl',
                                                            children:rowData.studySiteName,
                                                            attrs:{style:'padding-left:0.25rem;'}
                                                        },                                           
                                                    ]
                                                }
                                            }
                                        },    
                                        {
                                            width: 200,
                                            title: '操作',
                                            field: "operator",
                                            render: function(colData, rowData)  {
                                                let iconstr = 'love-nomal';
                                                if(rowData.status==1){
                                                    iconstr = 'love-blue';
                                                }
                                                let cellDom ={
                                                    component:'Button',
                                                    icon:iconstr,
                                                    type:'text',
                                                    tooltip: '取消关注',
                                                    onClick:function(){
                                                        // if(rowData.status==1){
                                                        //     new nomui.Message({
                                                        //         content: '取消关注',
                                                        //         type: 'success'
                                                        //     })
                                                        // }else if(rowData.status==2){
                                                        //     new nomui.Message({
                                                        //         content: '关注成功',
                                                        //         type: 'success'
                                                        //     })
                                                        // }
                                                        cancelAttention_user(rowData.id,resHandle);
                                                    }
                                                }
            
                                                return cellDom;
                                            }
                                        },                           
                                    ],
                                    _created: function () {
                                        getAttentionData();
                                    }
                                },
                                {
                                    component: 'Pager',
                                    ref: (c) => {pageDom1 = c},
                                    onPageChange: function () {
                                        getAttentionData(pageDom1);
                                    }
                                }
                            ]
                        },
                    }
                ],
            }
        }
    }
   
});