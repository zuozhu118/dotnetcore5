/*遗传办维护*/
define([], function() {

    let siteOrgId;
    let pkid;  //id 当前操作数据id，留痕表中pkid

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
            tableName:'src_Genetic',
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
        let searchParams={pkid:pkid,siteOrgId:siteOrgId,tableName:'src_Genetic',fieldType:radioDom.props.fieldType,
        field:radioDom.name,oldValue:radioDom.oldValue,newValue:radioDom.currentValue };
        commitReq(searchParams);
    };
    /***提交**/
    function commitReq(_params){
        axios.post(`/api/indbpersonal/update-org`,_params)
        .then(res=>{
            if(_params.field=='City') return;
            resHandle(res);
        });
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
                    component: 'Cols',strechIndex: 0,
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
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '联系人职务', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'Position',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container3 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('联系人职务',container3);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '联系电话', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ContactPhone',fieldType:'string',
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
                                {component: 'StaticText',value: '审核流程', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ReviewProess',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container7 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('审核流程',container7);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '盖章流程', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'StampProess',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container8 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('盖章流程',container8);},
                                }
                            ]                                           
                          },
                          {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'StaticText',value: '申请所需时间', type:'text', attrs:{style:'width:100px;'}},
                                {
                                    component: 'Container', breakpoint: 'md', attrs:{},name:'ApplicationTime',fieldType:'string',
                                    children:'',
                                    ref:(c)=>{container9 = c;}
                                },
                                {
                                    component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                    onClick:function(){openModal('申请所需时间',container9);},
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
                                {component: 'StaticText',value: '合同签署是否必须在遗传办审批同意后?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsContractSigned',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'StaticText',value: '批准前是否可以进行项目?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsProjectStart',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否有遗传办递交经验?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsExperienced',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否可以牵头递交遗传办?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsLeader',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否可以使用申办方账号申请遗传办流程?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsUsingSposor',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否有账号可以进行网上申报?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsHaveAccount',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio6=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio6);
                                    },
                                }
                            ]                                           
                          },

                          {
                            component:'div',
                            _created:()=>{
                                axios.get('/api/institution-db/org-claims/get-geneticenty-byorg?siteId='+siteOrgId)
                                .then((res) => {
                                    if (!res) return;
                                    pkid = res.id;
                                    container1.update({children:res.address});
                                    container2.update({children:res.contacts});
                                    container3.update({children:res.position});
                                    container4.update({children:res.contactPhone});
                                    container5.update({children:res.email});
                                    container6.update({children:res.fax});
                                    container7.update({children:res.reviewProess});
                                    container8.update({children:res.stampProess});
                                    container9.update({children:res.applicationTime});

                                    radio1.update({value:res.isContractSigned==true?1:res.isContractSigned==false?0:null});
                                    radio2.update({value:res.isProjectStart==true?1:res.isProjectStart==false?0:null});
                                    radio3.update({value:res.isExperienced==true?1:res.isExperienced==false?0:null});
                                    radio4.update({value:res.isLeader==true?1:res.isLeader==false?0:null});
                                    radio5.update({value:res.isUsingSposor==true?1:res.isUsingSposor==false?0:null});
                                    radio6.update({value:res.isHaveAccount==true?1:res.isHaveAccount==false?0:null});


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