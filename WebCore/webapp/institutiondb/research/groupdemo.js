define(function () {
    return {
        children: [
            {
                component: 'Button',
                name: 'button',
                text: '点我',
                attrs: {
                    onclick: function () {
                        new nomui.Modal({
                            size: 'xsmall',
                            content: {
                                component: 'Panel',
                                header: {
                                    caption: {
                                        title: 'hello',
                                    },
                                },
                                body: {
                                    children: [
                                        {
                                            children: 'I am a modal',
                                        },
                                    ],
                                },
                            },
                            onOk: (args) => {
                                new nomui.Message({ type: 'info', content: '点击了确定按钮' })
                                args.sender.close()
                            },
                        })
                    },
                },
            },
            {
                component: 'Button',
                name: 'button',
                text: '另一种',
                attrs: {
                    onclick: function () {
                        new nomui.Modal({
                            size: {
                                width: 5,
                            },
                            content: {
                                component: 'Panel',
                                header: {
                                    caption: {
                                        title: 'hello',
                                    },
                                },
                                body: {
                                    children: [
                                        {
                                            children: 'I am a modal',
                                        },
                                    ],
                                },
                            },
                            onOk: (args) => {
                                new nomui.Message({ type: 'info', content: '点击了确定按钮' })
                                args.sender.close()
                            },
                        })
                    },
                },
            },
        ],
    }
}
)