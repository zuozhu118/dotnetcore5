define([], function () {
    return {
        children: {
            attrs: {
                style: {
                    backgroundColor: 'white',
                    height: '1000px',
                    padding:'20px',
                }
            },
            component: 'Rows',
            items: [

                {
                    component: 'Collapse',
                    icon: {
                        default: 'plus',
                        open: 'down',
                    },
                    items: [
                        {
                            key: 1,
                            title: '项目基本信息',
                            content: '',
                        },
                        {
                            key: 2,
                            title: '项目基本信息',
                            //content: '',
                        },
                        {
                            key: 3,
                            title: '审批信息',
                            content: {
                                component: 'Rows',
                                attrs: {
                                    style: {
                                        padding: '10px',
                                        //backgroundColor: 'gray',
                                    }
                                },
                                items: [
                                    {
                                        tag: 'strong',
                                        children: '遗传资源专员审批：',
                                    },
                                    {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: 'span',
                                                children: '审批人：张小花',
                                            },
                                            {
                                                tag: 'span',
                                                children: '审批时间：2019-9-12 10:33',
                                            }],
                                    },
                                    {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: 'span',
                                                children: '审批意见：',
                                            },
                                            {
                                                tag: 'span',
                                                attrs: {
                                                    style: {
                                                        color: 'green',
                                                    }
                                                },
                                                children: '同意',
                                            }],
                                    },
                                ],
                            },
                        },
                    ]
                },

                {
                    component: 'RadioList',
                    labelAlign: 'left',
                    label: '审批：',
                    options: [
                        { text: '同意', value: '同意' },
                        { text: '退回修改', value: '退回修改' },
                       
                    ],
                },

                {
                    label: '意见：',
                    labelAlign: 'left',
                    component: 'MultilineTextbox',
                    value: '',

                },
                {
                    component: 'Field',
                    labelAlign: 'left',
                    label: '',
                    control: {
                        component: 'Cols',
                        items: [
                            {
                                component: 'Button',
                                type: 'primary',
                                text: '提交',
                                
                            },
                            {
                                component: 'Button',
                                text: '取消',
                            },

                        ],
                    },
                },],


        },
    }


});