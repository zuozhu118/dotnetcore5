/***我的纠错列表***/
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
        axios.post('/api/institution-db/org-corrections/get-mycorrection-list', searchParams)
        .then((res) => {
            dataSource = res&&res.items;
            gridDom.update({ data: dataSource });
            pageDom.update({ totalCount: res&&res.totalItems, pageIndex: res&&res.currentPage });
        })
    };

    let openDetailModal =(_data)=>{
        new nomui.Modal({
            content: {
              component: 'Panel',
              header: {caption: {title: '纠错详情',},},
              body: {
                children: [
                    {
                        children: {
                            component:'Rows',
                            items:[
                                {
                                    component:'Cols',
                                    items:[
                                        {component:'StaticText',value:'纠错字段',attrs:{style:'font-weight:600;width:100px;'},},
                                        {
                                            component:'StaticText',value: _data.fieldText,attrs:{style:'font-weight:600;'},
                                        }
                                    ]
                                }
                                ,
                                {
                                    component: 'Cols',
                                    items:
                                    [
                                        {component: 'StaticText',value: '原内容', attrs:{style:'width:100px;'}},
                                        {
                                            component: 'Container', breakpoint: 'md', attrs:{style:'width:600px;'},
                                            children:_data.originalValue,
                                        }
                                    ]                                           
                                },
                                {
                                    component: 'Cols',
                                    items:
                                    [
                                        {component: 'StaticText',value: '纠正为', attrs:{style:'width:100px;'}},
                                        {
                                            component: 'Container', breakpoint: 'md', attrs:{style:'width:600px;color:#2DCA5B'},
                                            children:_data.correctionContent,
                                        }
                                    ]                                           
                                },
                            ]
                        },
                    },
                ],
              },
              footer: (modal) => {
                return {
                  children: {
                    component: 'Cols',
                    items: [
                      {
                        component: 'Button',text: '关闭',
                        onClick: function () { modal.close()},
                      },
                    ],
                  },
                }
              },
            },
        })
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
                                                        }
                                                    ],
                                                    inline: true,
                                                }
                                            }                                         
                                        ]
                                    }
                                }
                            },
                            {
                                width: 200,
                                title: '纠错时间',
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
                                title: '纠错状态',
                                field: "status",
                                cellRender:function(col, row){
                                    let cellData = col.cellData == 1?'草稿':col.cellData ==2?'待审批':col.cellData ==3?'审批通过':col.cellData ==4?'未通过':'';
                                    return {
                                        component:'span',
                                        children:cellData,
                                        attrs:{
                                            style:"color:" + (col.cellData == 1?'#999999':col.cellData ==2?'#3da2d0':col.cellData ==3?'#34c856':col.cellData ==4?'#ff6633;':'#999999')
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

                                    cellDom ={
                                        children:[
                                            {
                                                component:'Button',size: 'small',
                                                text: '纠错详情',
                                                type: 'primary',
                                                // attrs:{style:'background-color:rgba(0, 191, 191);border-color:rgba(221, 221, 221, 1);color:white;',},
                                                onClick:()=>{
                                                    openDetailModal(rowData)
                                                }
                                            },
                                        ]

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