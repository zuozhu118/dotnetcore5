/****机构维护***/
define([], function(args) {
    return {
        styles: {
            color: 'white',
        },
        children: 
        [
            {
                component: "Menu",
                ref(c) {
                    self.menuRef = c;
                },
                direction: "horizontal",
                items: 
                [
                    {
                        text: '首页',
                        styles: {
                            padding: 10,
                        },
                        key:'dashboard',
                        onClick() {
                            location.href='#!dashboard';
                        },
                    }, 
                    {
                        text: '个人中心',
                        icon: "right",
                        onClick:function(){
                            location.href = "#!research/personcenter";
                        }
                    },
                    {
                        text: '认领机构维护',
                        icon: "right",
                    }
                ],
            },
            {
                component: 'Tabs',
                onTabSelectionChange: (e) => {
                    let key = e.sender.getSelectedItem().key;
                    switch(key){
                        case 'site':
                            tab1.update({children:{   
                            component: "Router",
                            defaultPath: "../orgMaintain", }});

                        break;
                        case 'ec':
                            tab2.update({children:{   
                            component: "Router",
                            defaultPath: "../ecMaintain", }});
                        break;
                        case 'genetic':
                            tab3.update({children:{   
                            component: "Router",
                            defaultPath: "../geneticMaintain", }});
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
                        item: { text: '机构' },
                        key:'site',
                        panel: {
                            // children:{
                            //     component:"Router",
                            //     defaultPath:'../orgMaintain'
                            // }
                            ref:(c)=>{panel1 =c;},
                            children:{
                                ref:(c)=>{tab1=c},     
                            }
                        },
                    },
                    {
                        item: { text: '伦理' },
                        key:'ec',
                        panel: {
                            ref:(c)=>{panel2 =c;},
                            children:{
                                ref:(c)=>{tab2=c},     
                            }
                        },
                    },
                    {
                        item: { text: '遗传办' },
                        key:'genetic',
                        panel: {
                            ref:(c)=>{panel3 =c;},
                            children:{
                                ref:(c)=>{tab3=c},     
                            }
                        },
                    },
                ],
                _rendered:function(){
                    if(tabRef.firstRender){
                        tab1.update({children:{   
                        component: "Router",
                        defaultPath: "../orgMaintain", }});
                    }
                }
            },
        ],
    }
});