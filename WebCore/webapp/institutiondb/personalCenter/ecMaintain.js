/*伦理维护*/
define([], function() {

    let siteOrgId;
    let pkid;  //id 当前操作数据id，留痕表中pkid
    let meetings =[];
    /*修改表格数据*/
    let updateGridData = sdscom.utils.updateGridData;
    /**文本修改提交**/
    let openModal = function(_text,_containerDom){
        if(!_containerDom){
            console.log('dom参数错误~');
            return;
        }
        let _data={
            text:_text,
            value:_containerDom.props.children,
            field:_containerDom.props.name,
            tableName:'src_EC',
            pkid:pkid,
            siteId:siteOrgId
        };
        new nomui.Modal({
            data: _data,
            size:'middle',
            handlDom:_containerDom,
            content: '/webapp/institutiondb/personalCenter/editTextModal.js',         
            onClose:function(args){
                if(args.result && args.result.isOk){
                    let _dom = args.sender.props && args.sender.props.handlDom;
                    if(_dom) _dom.update({children:args.result.newValue});
                }
            }
        });
    };


    /**单选按钮提交*/
    let changeRadio = function(radioDom){
        let searchParams={pkid:pkid,siteOrgId:siteOrgId,tableName:'src_EC',fieldType:radioDom.props.fieldType,
        field:radioDom.name,oldValue:radioDom.oldValue,newValue:radioDom.currentValue };
        commitReq(searchParams);
    };
    /***提交**/
    function commitReq(_params){
        axios.post(`/api/institution-db/org-claims/update-org`,_params)
        .then(res=>{
            if(_params.field=='City') return;
            resHandle(res);
        });
    }


    /*新增，修改伦理人员*/
    let openModalEditPerson = function(handleType,paraData,key){
        let groupEdit,radioEdit;
        new nomui.Modal({
            size:'middle',
            content: {
            component: 'Panel',
            header: {caption: {title: handleType=='add'?'新增':'编辑'}},
            body: 
            {
                children: 
                {
                component: 'Group',ref:(c)=>{groupEdit=c;},
                fields: 
                [
                    {
                    component: 'Textbox', name: 'name', label: '姓名',span: '6',required: true,             
                    onValueChange: (e) => {
                        if(e.newValue) paraData.name = e.newValue;
                    },
                    },
                    {
                    component: 'RadioList',name:'sex',options: [{ text: '男',value: 1,},{ text: '女',value: 2,},{ text: '未知',value: 3}],label:'性别',
                    ref:(c)=>{radioEdit=c;},fieldType:'radio',
                    onValueChange: (e) => {
                        paraData.sex = e.newValue.toString();
                    },
                    span: '6',
                    },
                    {
                    component: 'Textbox', name: 'position', label: '职务',span: '6',
                    onValueChange: (e) => {
                        if(e.newValue) paraData.position = e.newValue;
                    },
                    },
                    {
                    component: 'Textbox', name: 'telePhone', label: '电话',span: '6',
                    // rules: [{ type: 'tel', message: '电话格式不正确' }],
                    onValueChange: (e) => {
                        if(e.newValue) paraData.telePhone = e.newValue;
                    },
                    },
                    {
                    component: 'Textbox', name: 'email', label: '邮箱',span: '6',
                    // rules: [{ type: 'email', message: '邮箱格式不正确' }],
                    onValueChange: (e) => {
                        if(e.newValue) paraData.email = e.newValue;
                    }
                    },
                ],
                _rendered:function(){
                    if(groupEdit&& this.firstRender && handleType=='edit'){
                    groupEdit.setValue({
                        name:paraData&&paraData.name,sex:paraData&&paraData.sex=='1'?1:paraData.sex=='2'?2:3,
                        position:paraData&&paraData.position,telePhone:paraData&&paraData.telePhone,
                        email:paraData&&paraData.email
                    });
                    }
                }
                }
            },
            },
            onOk: (args) => {
            if(groupEdit.validate()){
                updateGridData(handleType,grid1,key,paraData);
                axios.post(`/api/institution-db/org-claims/add-update-ecperson`,paraData)
                .then(res=>{
                    resHandle(res);
                });
                args.sender.close()
            }
            },
        })
    }


    /***提交后操作**/
    function resHandle(res){
        if(res){
            new nomui.Alert({
                type: 'success',
                title: '操作成功',
                description: '您已成功完成修改~',
            });
        }else{
            new nomui.Alert({
                type: 'error',
                title: '操作错误',
                description: '请联系系统管理员~',
            });
        }
    }
    return (args)=>{
        siteOrgId = args.route.query.siteOrgId;
        return {
            view:{
                attrs:{
                    style:'color:"white";padding-left: 14px;',
                },
                children: 
                [ 
                  {
                    component: 'Cols',strechIndex: 1,
                    inline: true,
                    align:'start',
                    items: 
                    [
                      {
                        component: 'Rows',
                        items:[
                          {
                            component: 'AnchorContent',
                            key: 'top1',
                            children: {
                              tag:'div',       
                              children:[
                                { 
                                  attrs:{
                                    style:'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                  }
                                },
                                {
                                  children:'基本信息',
                                  attrs:{
                                    style:'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                  }
                                }
                              ]            
                            },        
                          },
                          /*********************************************************
                          * 
                          * 基本信息
                          * *******/
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '联系地址', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Address',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container1 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('联系地址',container1,resHandle);},
                                }
                            ]                                           
                          },
                         
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '联系人', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Contacts',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container2 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('联系人',container2);},
                                }
                            ]                                           
                          },
                        //   {
                        //     component: 'Cols',strechIndex: 1,
                        //     items:
                        //     [
                        //         {component: 'StaticText',value: '联系人职务', type:'text', attrs:{style:'width:100px;'}},
                        //         {
                        //             component: 'Container', breakpoint: 'md', attrs:{},name:'Position',fieldType:'string',
                        //             children:'',
                        //             ref:(c)=>{container3 = c;}
                        //         },
                        //         {
                        //             component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                        //             onClick:function(){openModal('联系人职务',container3);},
                        //         }
                        //     ]                                           
                        //   },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '联系电话', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Telephone',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container4 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('联系电话',container4);},
                                }
                            ]                                           
                          },

                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '邮箱', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Email',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container5 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('邮箱',container5);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '传真', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Fax',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container6 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('传真',container6);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '伦理网址', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Weblink',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container7 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('伦理网址',container7);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '伦理接待时间', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ReceiveTime',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container8 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('伦理接待时间',container8);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '伦理反馈时间', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'FeedbackTime',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container9 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('伦理反馈时间',container9);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '伦理递交的最后时限', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ApplyDate',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container10 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('伦理递交的最后时限',container10);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '获取批件时长', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ApprovalTime',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container11 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('获取批件时长',container11);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '伦理会议召开率', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'MeetingFrequency',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container12 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('伦理会议召开率',container12);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '收费标准', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ECFee',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container13 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('收费标准',container13);},
                                }
                            ]                                           
                          },

                          /*********************************************************
                          * 
                          * 基本信息 单选
                          * *******/
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '合是否有年审?', type:'text'},
                                {
                                    component: 'RadioList',name:'HasYearAudit',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio1=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio1);
                                    },
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '年审费用', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'yearAuditFee',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container14 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('年审费用',container14);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '有额外行政审查或审批?', type:'text'},
                                {
                                    component: 'RadioList',name:'HasOtherAudit',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio2=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio2);
                                    },
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '额外审批流程描述', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'OtherAuditComments',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container15 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('额外审批流程描述',container15);},
                                }
                            ]                                         
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '是否有前置伦理审批?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsPreEthical',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio3=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio3);
                                    },
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '是否有伦理互认机制?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsEthicalMutual',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio4=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio4);
                                    },
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: ' 是否需要提供伦理批件?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsLeaderEthical',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio5=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio5);
                                    },
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '是否可接受中心伦理?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsAloneECMeeting',options: [{ text: '是',value: 1,},{ text: '否',value: 0,},{ text: '有条件接受',value: 2,}],
                                    ref:(c)=>{radio6=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio6);
                                    },
                                }
                            ]                                           
                          },

                                                  /*********************************************************
                         * 
                         * 伦理人员
                         * *******/
                          {
                            component:'Cols',
                            items:[
                              {
                                tag:'div',      
                                span:10, 
                                children:[
                                {attrs:{style:'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'}},
                                {
                                    children:'伦理人员',
                                    attrs:{style:'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'}
                                }
                                ]   
                              },
                              {
                                component: 'Button',text: '新增', icon:'plus',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){
                                  let person = new NewECPerson();
                                  person.ecID = pkid; 
                                  openModalEditPerson('add',person);
                                },
                              }
                            ],
                            strechIndex: 0,
                            
                          },        
                          {
                            component: 'Grid',showTitle: true,
                            ref:(c)=>{grid1 = c;},
                            columns: 
                            [
                                {field: 'name',key: 'name',title: '姓名',width: 200,},
                                {field: 'position',key: 'position',title: '职务',},
                                {field: 'telePhone',key: 'telePhone',title: '电话',},
                                {field: 'email',key: 'email',title: '邮箱',width: 500,showTitle: false,},
                                {
                                    field: 'operator',key: 'operator',title: '操作',width: 180,
                                    render: function(colData, rowData)  
                                    {
                                    let that = this;
                                    return {   
                                        component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-left:93px;'},
                                        onClick:function(){
                                            let key = that.tr.key;
                                            let person = new NewECPerson();
                                            if(rowData){
                                            for(let kItem in rowData){
                                                person[kItem] = rowData[kItem];
                                            }
                                            }
                                            openModalEditPerson('edit',person,key);
                                        },
                                    }
                                    }
                                },
                            ]
                          },
  
                          /*********************************************************
                           * 
                           * 财务信息
                           * *******/
                          {
                            tag:'div',       
                            children:[
                            {attrs:{style:'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'}},
                            {
                                children:'财务信息',
                                attrs:{style:'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'}
                            }
                            ]            
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                            {component: 'StaticText',value: '单位信息', type:'text', attrs:{style:'width:80px;'}},
                            {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FI_Fullname',fieldType:'string',
                                children:'',
                                ref:(c)=>{container16 = c;}
                            },
                            {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('单位信息',container16);},
                            }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                            {component: 'StaticText',value: '单位账号', type:'text', attrs:{style:'width:80px;'}},
                            {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FI_Account',fieldType:'string',
                                children:'',
                                ref:(c)=>{container17 = c;}
                            },
                            {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('单位账号',container17);},
                            }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                            {component: 'StaticText',value: '开户行', type:'text', attrs:{style:'width:80px;'}},
                            {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FI_Bank',fieldType:'string',
                                children:'',
                                ref:(c)=>{container18 = c;}
                            },
                            {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('开户行',container18);},
                            }
                            ]                                          
                          },
                          /*********************************************************
                           * 
                           * 伦理会议
                           * *******/
                           {
                            component:'Cols',
                            items:[
                              {
                                tag:'div',      
                                span:10, 
                                children:[
                                {attrs:{style:'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'}},
                                {
                                    children:'伦理会议',
                                    attrs:{style:'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'}
                                }
                                ]   
                              },
                            //   {
                            //     component: 'Button',text: '新增', icon:'plus',
                            //     onClick:function(){

                            //     },
                            //   }
                            ],
                            strechIndex: 0,
                            
                          },
                          {
                            component: 'Grid',showTitle: true,
                            ref:(c)=>{grid2 = c;},
                            columns: 
                            [
                                {
                                    title: '日期',field: "meetingDate",attrs:{style:'color:#00BFBF'},
                                    cellRender:function(col){
                                        let cellData = nomui.utils.formatDate(col.cellData,'yyyy-MM-dd');
                                        return {
                                            component:'span',
                                            children:cellData
                                        }
                                    }
                                },
                                {
                                    field: 'operator',key: 'operator',title: '操作',width: 180,
                                    render: function(colData, rowData)  
                                    {
                                        let that = this;
                                        return {   
                                            component: 'Button',text: '删除', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                            onClick:function(){
                                                axios.get("/api/institution-db/org-claims/delete-ecmeeting-byid?id="+rowData.id)
                                                .then(res=>{
                                                    resHandle(res);
                                                });

                                                for(let i=0,len=meetings.length; i<len; i++){
                                                    if(meetings[i].id == rowData.id){
                                                        meetings.splice(i,1);
                                                            break;
                                                    }
                                                }
                                                grid2.update({data:meetings});
                                            },
                                        }
                                    }
                                },
                            ]
                          },


                          {
                            component:'div',
                            _created:()=>{
                                axios.get('/api/institution-db/org-claims/get-ecenty_byorg?siteId='+siteOrgId)
                                .then((res) => {
                                    if (!res) return;
                                    if (!res.ecModel) return;
                                    let ecModel = res.ecModel;
                                    pkid = ecModel.id;
                                    container1.update({children:ecModel.address});
                                    container2.update({children:ecModel.contacts});
                                    // container3.update({children:ecModel.position});
                                    container4.update({children:ecModel.telephone});
                                    container5.update({children:ecModel.email});
                                    container6.update({children:ecModel.fax});
                                    container7.update({children:ecModel.weblink});
                                    container8.update({children:ecModel.receiveTime});
                                    container9.update({children:ecModel.feedbackTime});
                                    container10.update({children:ecModel.applyDate});
                                    container11.update({children:ecModel.approvalTime});
                                    container12.update({children:ecModel.meetingFrequency});
                                    container13.update({children:ecModel.ecFee});
                                    container14.update({children:ecModel.yearAuditFee});
                                    container15.update({children:ecModel.otherAuditComments});
                                    container16.update({children:ecModel.fI_Fullname});
                                    container17.update({children:ecModel.fI_Bank});
                                    container18.update({children:ecModel.fI_Account});
                                    radio1.update({value:ecModel.hasYearAudit==true?1:ecModel.hasYearAudit==false?0:null});
                                    radio2.update({value:ecModel.hasOtherAudit==true?1:ecModel.hasOtherAudit==false?0:null});
                                    radio3.update({value:ecModel.isPreEthical==true?1:ecModel.isPreEthical==false?0:null});
                                    radio4.update({value:ecModel.isEthicalMutual==true?1:ecModel.isEthicalMutual==false?0:null});
                                    radio5.update({value:ecModel.isLeaderEthical==true?1:ecModel.isLeaderEthical==false?0:null});
                                    radio6.update({value:ecModel.isAloneECMeeting});

                                    grid1.update({data:res.ecPeoples || {}});
                                    meetings = res.ecMeetings || [];
                                    grid2.update({data:meetings});
                                });                     
                            }
                          }
                        ]
                      },                     
                    ]
                  }
  
                ]
        
            }
        }
    }
});