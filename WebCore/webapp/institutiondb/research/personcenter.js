define([], function () {

    let tabRef,
        groups,
        pagerRef;
    let username = "";
    let avasrc = ""
    let PhoneNumber = "";
    const user = nomapp.context.User;
    if (user != null) {
        username = user.DisplayName;
        avasrc = `/My/Account/Avatar/${nomapp.context.User.Id}_s`;
        PhoneNumber = user.PhoneNumber;
    }

    return {
        styles: {
            color: 'white',
        },
        children: [
            // {
            //     component: "Menu",
            //     ref(c) {
            //         self.menuRef = c;
            //     },
            //     direction: "horizontal",
            //     items: [{
            //         text: '首页',
            //         styles: {
            //             padding: 10,
            //         },
            //         onClick() {

            //         },
            //     }, {
            //         text: '个人中心',
            //         icon: "right",
            //         styles: { padding: 10 },
            //     },
            //     ],
            // },
            {
                component:'Cols',
                items:[
                    {
                        component: 'Breadcrumb',
                        items: [{
                            text: '首页',
                            url: '#!dashboard'
                        },
                        {
                            text: '个人中心',
                        }],
                    },
                    {
                        component:'Button',type:'primary',size: 'small',
                        text:'个人设置',
                        icon:'setting',
                        attrs:{style:'margin-right:10px;'},
                        onClick: () => {
                            window.open("/My/Account/SetPersonalData");
                        }
                    }
                ],strechIndex: 0,
            },
            {
                component: 'Tabs',
                onTabSelectionChange: (e) => {
                    let key = e.sender.getSelectedItem().key;
                    switch(key){
                        case 'follow':
                            tab1.update({children:{   
                            component: "Router",
                            defaultPath: "../../personalCenter/myFollowList", }});

                        break;
                        case 'claim':
                            tab2.update({children:{   
                            component: "Router",
                            defaultPath: "../../personalCenter/organizationClaimList", }});
                        break;
                        case 'correction':
                            tab3.update({children:{   
                            component: "Router",
                            defaultPath: "../../personalCenter/myCorrectionList", }});
                        break;
                    }
                },
                ref: c => {
                    tabRef = c
                },
                styles: {
                    padding: 20
                },
                uistyle: 'line',
                tabs: [
                    {
                        item: { text: '基本资料' },
                        panel: {
                            children: {
                                component: 'Cols',
                                items: [
                                    {
                                        tag: "img",
                                        ref: (c) => (avaRef = c),
                                        attrs: {
                                            src: avasrc,
                                            style: {
                                                width: "80px",
                                                height: "80px",
                                                'margin-left':'14px'
                                            }
                                        },
                                        styles: {
                                            shape: "circle",
                                        },
                                    },
                                    {
                                        attrs:{style:'margin-left:5px;'},
                                        // children: {
                                        //     component: 'Rows',
                                        //     items: [
                                        //         {
                                        //             tag: "span",
                                        //             children: username,
                                        //             attrs:{style:'font-weight: 600;'}
                                        //         },
                                        //         {
                                        //             // tag: "span",
                                        //             // children: PhoneNumber,
                                        //             component: 'MaskInfo',
                                        //             type: 'mobile',
                                        //             text: PhoneNumber,
                                        //         }
                                        //     ]
                                        // },
                                        children:[
                                            {
                                                tag: "span",
                                                children: username,
                                                attrs:{style:'font-weight: 600;display:block;'}
                                            },
                                            {
                                                component: 'MaskInfo',
                                                type: 'mobile',
                                                text: PhoneNumber,
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                    },
                    {
                        item: { text: '我的关注' },
                        key:'follow',

                        panel: {
                            ref:(c)=>{panel1 =c;},
                            children:{
                                ref:(c)=>{tab1=c},     
                                // component: "Router",
                                // defaultPath: "../../personalCenter/myFollowList",  ///defaultPath
                                // autoRender:false   
                            }
                        },
                    },
                    {
                        item: { text: '认领机构' },
                        key:'claim',

                        panel: {
                            children:{
                                ref:(c)=>{tab2=c},                           
                                // component: "Router",
                                // path: "../../personalCenter/organizationClaimList",
                                // autoRender:false
                            }
                        },
                    },
                    {
                        item: { text: '纠错记录' },
                        key:'correction',
                        panel: {
                            children:{
                                ref:(c)=>{tab3=c}
                            }
                        },
                    },
                ],
            },
        ],
    }
});

