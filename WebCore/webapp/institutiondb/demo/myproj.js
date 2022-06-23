define([], function () {
    return {
        component: 'Container',
        breakpoint: 'xxl',
        attrs: {
            style: {
                backgroundColor: 'white',
                //paddingTop: '100px',
                height: '1000px',
            },

        },
        component: 'Rows',
        items: [{
            children: '我的项目',
            attrs: {
                style: {
                    lineHeight: '30px',
                    'font-size': '20px',
                    paddingLeft: '20px',
                    paddingTop: '20px',
                    'padding-bottom':'80px',
                }
            }
        }, {
            children: {
                component: 'Timeline',
                mode: 'alternate',
                items: [
                    {
                        color: 'green',
                        dot: {
                            attrs: {
                                style: {
                                    'font-size': '26px',
                                },
                            },
                            component: 'Icon',
                            type: 'check-circle',
                        },
                        children: {
                            tag: 'div',
                            children: '立项阶段',
                            attrs: {
                                style: {
                                    backgroundColor: 'green',
                                    color: 'white',
                                    width: '100px',
                                    lineHeight: '36px',
                                    textAlign: 'center',
                                    'border-radius': '8px',
                                }
                            }
                        }
                    },
                    {
                        children: {
                            component: 'Cols',
                            strechIndex: 0,
                            attrs: {
                                style: {
                                    width: '300px',
                                    border: '1px solid',
                                    padding: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    display: 'inline-flex',
                                    'border-radius': '8px',
                                }
                            },
                            items: [{
                                component: 'Rows',
                                items: [{
                                    component: 'Cols',
                                    items: [{ children: 'CRA第一次提交', }, {
                                        children: '退回',
                                        attrs: {
                                            style: {
                                                color: 'red'
                                            }
                                        }
                                    }],
                                },
                                {
                                    component: 'Cols',
                                    children: '2017-03-12  10:12',
                                }],
                            },
                            {
                                tag: 'div',
                                children: '超时',
                                attrs: {
                                    style: {
                                        backgroundColor: 'red',
                                        color: 'white',
                                        width: '40px',
                                        textAlign: 'center',
                                    }
                                }
                            }],
                        },
                    },
                    {
                        children: {
                            component: 'Cols',
                            strechIndex: 0,
                            attrs: {
                                style: {
                                    width: '300px',
                                    border: '1px solid',
                                    padding: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    display: 'inline-block',
                                    'border-radius': '8px',
                                }
                            },
                            items: [{
                                component: 'Rows',
                                items: [{
                                    component: 'Cols',
                                    items: [{ children: 'CRA第一次提交', }, {
                                        children: '通过',
                                        attrs: {
                                            style: {
                                                color: 'green'
                                            }
                                        }
                                    }],
                                },
                                {
                                    component: 'Cols',
                                    children: '2017-03-12  10:12',
                                }],
                            }],
                        },
                    },
                    {
                        children: {
                            component: 'Cols',
                            strechIndex: 0,
                            attrs: {
                                style: {
                                    width: '300px',
                                    border: '1px solid',
                                    padding: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    display: 'inline-block',
                                    'border-radius': '8px',
                                }
                            },
                            items: [{
                                component: 'Rows',
                                items: [{
                                    component: 'Cols',
                                    items: [{ children: 'CRA第一次提交', }, {
                                        children: '通过',
                                        attrs: {
                                            style: {
                                                color: 'green'
                                            }
                                        }
                                    }],
                                },
                                {
                                    component: 'Cols',
                                    children: '2017-03-12  10:12',
                                }],
                            }],
                        },
                    },
                    {
                        color: 'blue',
                        dot: {
                            attrs: {
                                style: {
                                    'font-size': '26px',
                                },
                            },
                            component: 'Icon',
                            type: 'exclamation-circle',
                        },
                        children: {
                            tag: 'div',
                            children: '伦理阶段',
                            attrs: {
                                style: {
                                    backgroundColor: 'blue',
                                    color: 'white',
                                    width: '100px',
                                    lineHeight: '36px',
                                    textAlign: 'center',
                                    'border-radius': '8px',
                                }
                            }
                        }
                    },
                    {
                        children: {
                            component: 'Cols',
                            strechIndex: 0,
                            attrs: {
                                style: {
                                    width: '300px',
                                    border: '1px solid',
                                    padding: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    display: 'inline-block',
                                    'border-radius': '8px',
                                }
                            },
                            items: [{
                                component: 'Rows',
                                items: [{
                                    component: 'Cols',
                                    items: [{ children: 'CRA第一次提交', }, {
                                        children: '通过',
                                        attrs: {
                                            style: {
                                                color: 'green'
                                            }
                                        }
                                    }],
                                },
                                {
                                    component: 'Cols',
                                    children: '2017-03-12  10:12',
                                }],
                            }],
                        },
                    },
                    {
                        children: {
                            component: 'Cols',
                            strechIndex: 0,
                            attrs: {
                                style: {
                                    width: '300px',
                                    border: '1px solid',
                                    padding: '10px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    display: 'inline-block',
                                    'border-radius': '8px',
                                }
                            },
                            items: [{
                                component: 'Rows',
                                items: [{
                                    component: 'Cols',
                                    items: [{ children: 'CRA第一次提交', }, {
                                        children: '通过',
                                        attrs: {
                                            style: {
                                                color: 'green'
                                            }
                                        }
                                    }],
                                },
                                {
                                    component: 'Cols',
                                    children: '2017-03-12  10:12',
                                }],
                            }],
                        },
                    },

                    {
                        //color: 'blue',
                        dot: {
                            //attrs: {
                            //    style: {
                            //        'font-size': '26px',
                            //    },
                            //},
                            component: 'Icon',
                            type: 'check-circle',
                        },
                        
                    },

                ],
            }}],

        
    }
});