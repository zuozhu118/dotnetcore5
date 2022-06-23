/*机构维护*/
define([], function() {
    let dataSet ={},/*结果集*/
    data={}, /*临床试验项目*/
    dataSiteInfo={}, /*研究中心*/
    dataSiteRawList=[]; /*参与机构*/
    let areaAll=[],country=[],province=[],city=[];
    let siteOrgId;
    /*修改表格数据*/
    let updateGridData = sdscom.utils.updateGridData;
    /**文本修改提交**/
    let openModal = function(field,containerDom,callback){
      if(!containerDom){
        console.log('dom参数错误~');
        return;
      }
      let content_value = containerDom.props.children;
      new nomui.Modal({
          size:'middle',
          content: {
            component: 'Panel',
            header: {
              caption: {
                title: '编辑',
              },
            },
            body: {
              children: [
                {
                  children: 
                  [
                    {
                      component:'Cols',strechIndex: 1,
                      items:
                      [
                        {
                            component:'Button',
                            text:field,
                            type:'text'
                        },
                        {
                            component: 'MultilineTextbox',
                            autoSize: true,
                            ref:(c)=>{
                                txtDom =c
                            },
                            attrs:{},
                            value: content_value,
                            onValueChange: (e) => {
                              //console.log(e.newValue)
                            },
                        }
                      ]
                    },

                  ],
                },
              ],
            },
          },
          onOk: (args) => {
              if(txtDom.props.value  && containerDom.props.children != txtDom.props.value ){
                  let searchParams={pkid:siteOrgId,siteOrgId:siteOrgId,tableName:'cts_StudySiteInfo',fieldType:containerDom.props.fieldType,
                  field:containerDom.props.name,oldValue:containerDom.props.children,newValue:txtDom.props.value };
                  commitReq(searchParams);
                  containerDom.update({children:txtDom.props.value});

              }else{
                  console.log("不用修改")
              }
            args.sender.close()
          },
      })
    };

    /**单选按钮提交*/
    let changeRadio = function(radioDom){
        let searchParams={pkid:siteOrgId,siteOrgId:siteOrgId,tableName:'cts_StudySiteInfo',fieldType:radioDom.props.fieldType,
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

    /*新增，修改机构人员*/
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
                //{
                //  component: 'Textbox', name: 'position', label: '职务',span: '6',
                //  onValueChange: (e) => {
                //    if(e.newValue) paraData.position = e.newValue;
                //  },
                //},
                {
                    component: 'Select', label: '职务', span: '6', name: 'position', allowClear: false,
                    options: [
                        {
                            text: '机构主任',
                            value: '机构主任',
                        },
                        {
                            text: '机构副主任',
                            value: '机构副主任',
                        },
                        {
                            text: '机构办主任',
                            value: '机构办主任',
                        },
                        {
                            text: '机构办副主任',
                            value: '机构办副主任',
                        },
                        {
                            text: '机构办秘书',
                            value: '机构办秘书',
                        },
                        {
                            text: '药物管理员',
                            value: '药物管理员',
                        },
                        {
                            text: '质量管理员',
                            value: '质量管理员',
                        },
                        {
                            text: '资料管理员',
                            value: '资料管理员',
                        },
                        {
                            text: '项目管理员',
                            value: '项目管理员',
                        },
                        {
                            text: '其他',
                            value: '其他',
                        },
                    ],
                    onValueChange: function (e) {
                        if (e.newValue) paraData.position = e.newValue;
                    }
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
            axios.post(`/api/institution-db/org-claims/add-update-orgperson`,paraData)
            .then(res=>{
              resHandle(res);
            });
            args.sender.close()
          }
        },
      })
    }

    let openMOdalEditArea=function(_province,_city){
      new nomui.Modal({
          size:'middle',
          content: {
            component: 'Panel',
            header: {
              caption: {
                title: '编辑',
              },
            },
            body: {
              children: [
                {
                  children: 
                  [
                    {
                      component:'Cols',
                      items:
                      [
                        {
                          component:'Button',
                          text:'省市',
                          type:'text'
                        },
                        {
                          component: 'Cols',strechIndex: 1,
                          items:[
                            {
                              component:'Select',attrs:{style:'width:190px;'},
                              ref:(c)=>{modalSelect2=c;},options:[],
                              onValueChange:function(e){
                                if(modalSelect3){
                                  city=[];
                                  for(let i=0,len = areaAll.length;i<len;i++){
                                    if(areaAll[i].areaType==3 && areaAll[i].parentAreaCode==e.newValue){
                                      let newItem={};
                                      newItem.text = areaAll[i].areaName;
                                      newItem.value = areaAll[i].areaCode;
                                      city.push(newItem);
                                    }
                                  }
                                  modalSelect3.update({options:city});
                                }
                              }
                            },
                            {
                              component:'Select',attrs:{style:'width:190px;'},
                              ref:(c)=>{modalSelect3=c;},options:[],
                            },                            
                          ],
                          _rendered:function(){
                            if(!areaAll) return;
                            city=[];
                            if(province == [] || province.length==0){
                              for(let i=0,len = areaAll.length;i<len;i++){
                                if(areaAll[i].areaType==2 && areaAll[i].parentId=='672378685431703113'){
                                  let newItem={};
                                  newItem.text = areaAll[i].areaName;
                                  newItem.value = areaAll[i].areaCode;
                                  province.push(newItem);
                                }
                              }
                            }


                            for(let i=0,len = areaAll.length;i<len;i++){
                              if(areaAll[i].areaType==3 && areaAll[i].parentAreaCode==_province){
                                let newItem={};
                                newItem.text = areaAll[i].areaName;
                                newItem.value = areaAll[i].areaCode;
                                city.push(newItem);
                              }
                            }
                            modalSelect2.update({options:province});
                            modalSelect2.update({value:_province});
                            modalSelect3.update({options:city});
                            modalSelect3.update({value:_city});

                          } 
                        }
                      ]
                    },

                  ],
                },
              ],
            },
          },
          onOk: (args) => {
              let newProvince = modalSelect2.getValue(),newCity = modalSelect3.getValue();
              if(newProvince && newProvince != _province){
                let searchParams={pkid:siteOrgId,siteOrgId:siteOrgId,tableName:'cts_StudySiteInfo',fieldType:'string',
                field:'Province',oldValue:_province,newValue:newProvince };
                commitReq(searchParams);
                select2.update({options:[{text:modalSelect2.getValueText(),value:newProvince}]});
                select2.update({value:newProvince});

              }
              if(newCity && newCity != _city){
                let searchParams={pkid:siteOrgId,siteOrgId:siteOrgId,tableName:'cts_StudySiteInfo',fieldType:'string',
                field:'City',oldValue:_city,newValue:newCity };
                commitReq(searchParams);
                select3.update({options:[{text:modalSelect3.getValueText(),value:newCity}]});
                select3.update({value:newCity});
              }
            args.sender.close();
          }
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
                              {component: 'StaticText',value: '机构地址', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'SiteAddress',fieldType:'string',
                                children:'',
                                ref:(c)=>{container1 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构地址',container1,resHandle);},
                              }
                            ]                                           
                        },

                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '省市', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component:'Cols',
                                items:[
                                  // {
                                  //   component:'Select',attrs:{style:'width:190px;'},
                                  //   ref:(c)=>{select1=c;},options:[],
                                  //   onValueChange:function(e){
                                  //     console.log(e);
                                  //     if(select2){
                                  //       province=[];
                                  //       city=[];
                                  //       select3.update({options:[]});
                                  //       for(let i=0,len = areaAll.length;i<len;i++){
                                  //         if(areaAll[i].areaType==2 && areaAll[i].parentId==e.newValue){
                                  //           let newItem={};
                                  //           newItem.text = areaAll[i].areaName;
                                  //           newItem.value = areaAll[i].id;
                                  //           province.push(newItem);
                                  //         }
                                  //       }
                                  //       select2.update({options:province});
                                  //     }
                                  //   }
                                  // },
                                  {
                                    component:'Select',attrs:{style:'width:190px;'},
                                    ref:(c)=>{select2=c;},options:[],
                                    disabled:true,
                                  },
                                  {
                                    component:'Select',attrs:{style:'width:190px;'},
                                    ref:(c)=>{select3=c;},options:[],
                                    disabled:true,
                                  },
                                  {
                                    component:'StaticText',attrs:{style:'width:190px;'},
                                  }
                                ]
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){
                                  openMOdalEditArea(select2.getValue(),select3.getValue());
                                },
                              }
                            ],
                            _rendered:function(){
                              axios.get('/api/institution-db/org-claims/get-all-area-list')
                              .then(res=>{
                                areaAll = res;
                                // for(let i=0,len = res.length;i<len;i++){
                                //   if(res[i].areaType==1){
                                //     let newItem={};
                                //     newItem.text = res[i].areaName;
                                //     newItem.value = res[i].id;
                                //     country.push(newItem);
                                //   }
                                // }

                                // console.log(country);
                                // select1.update({options:country});
                                // select1.update({value:"672373015241870323"});

                              });
                            }                                         
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '联系人', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'Contacts',fieldType:'string',
                                children:'',
                                ref:(c)=>{container3 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('联系人',container3);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '联系方式', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'ContactPhone',fieldType:'string',
                                children:'',
                                ref:(c)=>{container4 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('联系方式',container4);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '接待时间', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'ReceiveTime',fieldType:'string',
                                children:'',
                                ref:(c)=>{container5 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('接待时间',container5);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '机构网址', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'WebLink',fieldType:'string',
                                children:'',
                                ref:(c)=>{container6 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构网址',container6);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '机构传真', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'Fax',fieldType:'string',
                                children:'',
                                ref:(c)=>{container7 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构传真',container7);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '机构邮箱', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'Email',fieldType:'string',
                                children:'',
                                ref:(c)=>{container8 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构邮箱',container8);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '机构描述', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'OrganizationDescription',fieldType:'string',
                                children:'',
                                ref:(c)=>{container9 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构描述',container9);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '立项费用', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'ProjectApprovalFee',fieldType:'string',
                                children:'',
                                ref:(c)=>{container10 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('立项费用',container10);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '机构对费用的要求', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FeeDemand',fieldType:'string',
                                children:'',
                                ref:(c)=>{container11 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('机构对费用的要求',container11);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '文件保存年限及费用要求', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FileStore',fieldType:'string',
                                children:'',
                                ref:(c)=>{container12 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('文件保存,年限及费用要求',container12,resHandle);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '集中审查频率', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'TogetherReviewFreq',fieldType:'string',
                                children:'',
                                ref:(c)=>{container13 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('集中审查频率',container13);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: '合同签署时间（天）', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'ContractTime',fieldType:'string',
                                children:'',
                                ref:(c)=>{container14 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('合同签署时间（天）',container14,resHandle);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: ' 立项审核通过时间（天）', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'ProjectApprovalTime',fieldType:'string',
                                children:'',
                                ref:(c)=>{container15 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('立项审核通过时间（天）',container15);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: 'SMO选择', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'SMO_Selection',fieldType:'string',
                                children:'',
                                ref:(c)=>{container16 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('SMO选择',container16);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                              {component: 'StaticText',value: 'CRC管理', type:'text', attrs:{style:'width:100px;text-alignleft;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'CRC_Management',fieldType:'string',
                                children:'',
                                ref:(c)=>{container17 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('CRC管理',container17);},
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
                                {component: 'StaticText',value: '是否使用电子系统？', type:'text'},
                                {
                                    component: 'RadioList',name:'IsUsingSIS',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'StaticText',value: '机构是否需要立项？', type:'text'},
                                {
                                    component: 'RadioList',name:'IsProjectApproval',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '立项是否集中审查?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsTogetherReview',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否使用机构的合同模板?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsContractTemplate',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否可以签署三方协议?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsTripleAgreement',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
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
                                {component: 'Button',text: '是否需要法务审核?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsLegalReview',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio6=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio6);
                                    },
                                }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '是否有中心药房?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsCenterDrug',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio7=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio7);
                                    },
                                }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '关中心前是否需要质控?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsQCClosing',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio8=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio8);
                                    },
                                }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: '关中心时是否要提交自查报告?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsSelfCheck',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio9=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio9);
                                    },
                                }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                                {component: 'Button',text: 'CRC是否可以入驻本医院?', type:'text'},
                                {
                                    component: 'RadioList',name:'IsCRCEnter',options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                                    ref:(c)=>{radio10=c;},fieldType:'radio',
                                    onValueChange: (e) => {
                                        changeRadio(radio10);
                                    },
                                }
                            ]                                           
                        },

                        /*********************************************************
                         * 
                         * 机构人员
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
                                  children:'机构人员',
                                  attrs:{style:'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'}
                              }
                              ]   
                            },
                            {
                              component: 'Button',text: '新增', icon:'plus',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                              onClick:function(){
                                let person = new siteperson();
                                person.siteID = siteOrgId; 
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
                                            let person = new siteperson();
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
                                ref:(c)=>{container18 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('单位信息',container18);},
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
                                ref:(c)=>{container19 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('单位账号',container19);},
                              }
                            ]                                           
                        },
                        {
                            component: 'Cols',strechIndex: 1,
                            items:
                            [
                            //   {
                            //     component: 'StaticText',name: 'FI_Bank',label: '开户行',value:'asdfasdfasdf',
                            //     ref:(c)=>{container22 = c;}
                            //   },
                              {component: 'StaticText',value: '开户行', type:'text', attrs:{style:'width:80px;'}},
                              {
                                component: 'Container', breakpoint: 'md', attrs:{},name:'FI_Bank',fieldType:'string',
                                children:'',
                                ref:(c)=>{container20 = c;}
                              },
                              {
                                component: 'Button',text: '编辑', icon:'edit',type:'primary',size: 'small',attrs:{style:'margin-right:20px;'},
                                onClick:function(){openModal('开户行',container20);},
                              }
                            ]                                          
                        },

                        {
                            component:'div',
                            _created:()=>{
                                axios.get(`/api/institution-db/org-claims/get-studysite-info?id=`+siteOrgId)
                                .then((res) => {
                                  dataSiteInfo = res.studySiteInfo || {};
                                  console.log(dataSiteInfo)
                                  container1.update({children:dataSiteInfo.siteAddress});
                                  container3.update({children:dataSiteInfo.contacts});
                                  container4.update({children:dataSiteInfo.contactPhone});
                                  container5.update({children:dataSiteInfo.receiveTime});
                                  container6.update({children:dataSiteInfo.webLink});
                                  container7.update({children:dataSiteInfo.fax});
                                  container8.update({children:dataSiteInfo.email});
                                  container9.update({children:dataSiteInfo.organizationDescription});
                                  container10.update({children:dataSiteInfo.projectApprovalFee});
                                  container11.update({children:dataSiteInfo.feeDemand});
                                  container12.update({children:dataSiteInfo.fileStore});
                                  container13.update({children:dataSiteInfo.togetherReviewFreq});
                                  container14.update({children:dataSiteInfo.contractTime});
                                  container15.update({children:dataSiteInfo.projectApprovalTime});
                                  container16.update({children:dataSiteInfo.smO_Selection});
                                  container17.update({children:dataSiteInfo.crC_Management});
                                  container18.update({children:dataSiteInfo.fI_Fullname});
                                  container19.update({children:dataSiteInfo.fI_Bank});
                                  container20.update({children:dataSiteInfo.fI_Account});

                                  radio1.update({value:dataSiteInfo.isUsingSIS==true?1:dataSiteInfo.isUsingSIS==false?0:null});
                                  radio2.update({value:dataSiteInfo.isProjectApproval==true?1:dataSiteInfo.isProjectApproval==false?0:null});
                                  radio3.update({value:dataSiteInfo.isTogetherReview==true?1:dataSiteInfo.isTogetherReview==false?0:null});
                                  radio4.update({value:dataSiteInfo.isContractTemplate==true?1:dataSiteInfo.isContractTemplate==false?0:null});
                                  radio5.update({value:dataSiteInfo.isTripleAgreement==true?1:dataSiteInfo.isTripleAgreement==false?0:null});
                                  radio6.update({value:dataSiteInfo.isLegalReview==true?1:dataSiteInfo.isLegalReview==false?0:null});
                                  radio7.update({value:dataSiteInfo.isCenterDrug==true?1:dataSiteInfo.isCenterDrug==false?0:null});
                                  radio8.update({value:dataSiteInfo.isQCClosing==true?1:dataSiteInfo.isQCClosing==false?0:null});
                                  radio9.update({value:dataSiteInfo.isSelfCheck==true?1:dataSiteInfo.isSelfCheck==false?0:null});
                                  radio10.update({value:dataSiteInfo.isCRCEnter==true?1:dataSiteInfo.isCRCEnter==false?0:null});

                                  grid1.update({data:res.sitePeoples || {}});
                                  let orglocal = res.orgLocation||{};
                                  select2.update({options:[{text:orglocal.provinceName,value:orglocal.province}]});
                                  select2.update({value:orglocal.province});
                                  select3.update({options:[{text:orglocal.cityName,value:orglocal.city}]});
                                  select3.update({value:orglocal.city});

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