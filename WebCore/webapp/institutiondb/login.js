define([], function () {
    let formRef = null
    return {
        header: {
            caption: {
                title: 'WeTrial  机构数据库' },
        },
        body: {
            children: {
                component: 'Group',
                ref: c => {
                    formRef  = c
                },
                labelAlign: 'left',
                fields: [
                    {
                        component: 'Textbox',
                        name: 'roleName',
                        required: true,
                    },
                    {
                        name: 'password',
                        component: 'Password',
                        required: true,
                    },
                ],
            }
        },
        footer: {
            styles: {
                justify: 'center',
            },
            children: {
                component: 'Cols',
                items: [
                    {
                        component: 'Button',
                        styles: {
                            color: 'primary',
                        },
                        attrs: {
                            style: {
                                width:'200px'
                            }
                        },
                        text: "登录",
                        onClick: () => {
                            if (formRef.validate()) {
                                const postData = formRef.getValue();
                                postData["__RequestVerificationToken"] = $("input[name=__RequestVerificationToken]").val();
                                axios.post('/Common/Auth/UserLogin', postData, { loading: true })
                                    .then(response => {
                                        //alert('登录成功！！！！！');
                                        //modal.close(response)
                                    })
                            }
                        },
                    },
                    
                ],
            },
        },
    }
});
