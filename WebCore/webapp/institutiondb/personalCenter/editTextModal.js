define([], function() {
    let data;
    let commit =function(_data,_modal){
        axios.post('/api/institution-db/org-claims/update-org',_data)
        .then(res=>{
            _modal.close({
                isOk:res,
                newValue:_data.newValue
            });
            if(res){
                new nomui.Alert({
                    type: 'success',
                    title: '操作成功',
                    description: '您已成功修改~',
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

    return function(modal){
        data = modal.props.data || {};
        return {
            header: {
                caption: { title: '编辑' },
            },
            body: {
                children: 
                {
                    component:'Cols',
                    items:[
                        {
                            component:'StaticText',
                            value:data.text,
                            attrs:{style:'font-weight:600;'}
                        },
                        {
                            component: 'MultilineTextbox',
                            autoSize: true,
                            ref:(c)=>{txtDom=c;},
                            name: data.field,
                            value: data.value,
                        }
                    ],
                    strechIndex: 1
                },

            },
            onOk: () => {
                let newValue = txtDom.getValue();
                if(newValue && newValue != data.value){
                    let input = new OrgClaimUpdateInput();
                    input.siteOrgId = data.siteId;
                    input.pkid = data.pkid;
                    input.tableName= data.tableName;
                    input.field= data.field;
                    input.fieldType='string';
                    input.oldValue= data.value;
                    input.newValue= newValue;
                    commit(input,modal);
                }else{
                    modal.close();
                }
            },
        };
    }  
});