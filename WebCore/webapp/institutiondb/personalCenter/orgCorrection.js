/*纠错操作页*/
define([], function() {
    //提交
    let commit =function(_data){
        axios.post('/api/institution-db/org-corrections/add-correction',_data)
        .then(res=>{
            if(res){
                new nomui.Alert({
                    type: 'success',
                    title: '操作成功',
                    description: '您已成功提交纠错~',
                });
            }else{
                new nomui.Alert({
                    type: 'error',
                    title: '操作错误',
                    description: '请联系系统管理员~',
                });
            }
        });
    }
    //获取值的组件
    let getComponent = function(_type,_name,_value){
        let _dom={};
        switch(_type){
            case 'textbox':
                _dom= {
                    component: 'Textbox',
                    ref:(c)=>{domThis=c;},
                    name: _name,
                    value:_value,
                }
            break;
            case 'radio':
                if(_value=='是' || _value == true || _value == 'true' || _value == 1) _value = 1;
                else if (_value=='否' || _value == false || _value == 'false' || _value == 0) _value = 0;
                else _value=null;
                _dom= {
                    component: 'RadioList',name:_name,options: [{ text: '是',value: 1,},{ text: '否',value: 0,}],
                    ref:(c)=>{domThis=c;},
                    onValueChange: (e) => {
                    },
                    value:_value
                }
            break;
        }
        divDom.update({children:_dom})
    }

    return function(modal){
        return {
            header: {
                caption: { title: '纠错' },
            },
            body: {
                children: {
                    component:'Rows',
                    items:[
                        {
                            component:'StaticText',
                            value:'您提供的信息经平台审核通过后，您将获得相应积分。您可以在个人中心-纠错记录查看纠错审核状态。',
                        },
                        {
                            component:'Cols',
                            items:[
                                {
                                    component:'StaticText',
                                    value:modal.props.data.text,
                                    attrs:{style:'font-weight:600;'}
                                },
                                // {
                                //     component: 'Textbox',
                                //     ref:(c)=>{txtDom=c;},
                                //     name: modal.props.data.field,
                                //     value:modal.props.data.value,
                                // }
                                {
                                    tag:'div',
                                    ref:(c)=>{divDom=c},
                                    _created:function(){
                                        let domtype='textbox';
                                        if(modal.props.data.domtype) domtype = modal.props.data.domtype;
                                        return getComponent(domtype,modal.props.data.field,modal.props.data.value);
                                    }
                                }
                            ],
                            strechIndex: 1
                        },

                    ]
                },
            },
            onOk: () => {
                let input = new AddCorrectionInput();
                let tableName='';
                switch(modal.props.data.tabText){
                    case '机构':
                        tableName='cts_StudySiteInfo';
                    break;
                    case '伦理':
                        tableName='src_EC';
                    break;
                    case '遗传办':
                        tableName='src_Genetic';
                    break;
                }
                input.siteId = modal.props.data.siteId;
                input.correctionContent=domThis.getValue();
                input.integral=0;
                input.field=modal.props.data.field;
                input.fieldText=modal.props.data.text;
                input.pkid = modal.props.data.pkid;
                input.tableName= tableName;
                input.originalValue = modal.props.data.value;
                input.fieldType =  modal.props.data.fieldtype;    //默认为0、字符串； 1、bool
                if(!input.correctionContent && (input.correctionContent !=0 || input.correctionContent !=false)){
                    new nomui.Message({
                        content: '输入内容不能为空',
                        type: 'error'
                    });
                    return;
                }
                if(input.correctionContent.replace(/\s+/g,"")==''){
                    new nomui.Message({
                        content: '输入内容不能为空',
                        type: 'error'
                    });
                    return;
                }
                if(!input.field || !input.fieldText || !input.tableName || !input.pkid || (!input.fieldType && input.fieldType !=0) ){
                    console.log('参数错误~');
                    return;
                }
                commit(input);
                modal.close();
            },
        };
    }  
});