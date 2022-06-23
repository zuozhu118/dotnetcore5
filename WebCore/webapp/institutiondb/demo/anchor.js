define([], function () {
    let tabContent,tabContent2,tabContent3;
    return {
        component: 'Container',
        breakpoint: 'xxl',
        attrs: {
            style: {
                backgroundColor: 'white',
            },
            
        },
        children: {
            component: 'Cols',
            align: 'start',
            items: [
                {
                    component: 'Anchor',
                    sticky: true,
                    container: window,
                    items: [
                        { text: '锚点1', key: 'div1' },
                        {
                            text: '锚点2', key: 'div2'
                        },
                        { text: '锚点3', key: 'div3' },
                       
                    ],
                },
                {
                    component: 'Rows',
                    attrs: {
                        style: {
                            borderLeft: '1px solid',
                            width: '80.46rem',
                        },

                    },
                    items: [
                        {
                            component: 'AnchorContent',
                            key: 'div1',
                            attrs: {
                                style: {
                                    height: '500px',
                                },
                            },
                            children: {
                                component: 'Panel',
                                header: {
                                    styles: {
                                        justify: 'between',
                                    },
                                    caption: {
                                        title: '锚点标题1',
                                    },
                                    tools: [
                                        {
                                            component: 'TabList',
                                            tabContent: () => {
                                                return tabContent
                                            },
                                            selectedItems: 'tab1',
                                            onTabSelectionChange: () => {
                                                
                                            },
                                            items: [
                                                {
                                                    key: 'tab1',
                                                    text: '基本信息',
                                                },
                                                {
                                                    key: 'tab2',
                                                    text: '方案摘要',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                body: {
                                    children: {
                                        component: 'TabContent',
                                        ref: (c) => {
                                            tabContent = c
                                        },
                                        selectedPanel: 'tab1',

                                        panels: [
                                            {
                                                key: 'tab1',
                                                children: {
                                                    component: 'Rows',
                                                    gutter: 'md',
                                                    items: [
                                                        
                                                        {
                                                            component: 'Grid',
                                                            ref: (c) => {
                                                                table = c
                                                            },
                                                            columns: [
                                                                {
                                                                    field: 'name',
                                                                    title: '序号',
                                                                },
                                                                {
                                                                    field: 'author',
                                                                    title: '文件夹名',
                                                                    
                                                                },
                                                                {
                                                                    field: 'role',
                                                                    title: '备注',
                                                                    
                                                                },
                                                                {
                                                                    field: 'tags',
                                                                    title: '操作',
                                                                   
                                                                    render: function (tags) {
                                                                        const tagItems = tags.map(function (tag) {
                                                                            return {
                                                                                tagobj: tag,
                                                                            }
                                                                        })
                                                                        return {
                                                                            component: 'List',
                                                                            gutter: 'md',
                                                                            items: tagItems,
                                                                            itemDefaults: {
                                                                                styles: {
                                                                                    border: '1px',
                                                                                    padding: ['x-1', 'y-d125'],
                                                                                },
                                                                                _config: function () {
                                                                                    return this.setProps({
                                                                                        children: this.props.tagobj,
                                                                                    })
                                                                                },
                                                                            },
                                                                        }
                                                                    },
                                                                },
                                                            ],
                                                            data: [
                                                                {
                                                                    id: 1,
                                                                    name: '1',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],
                                                                    
                                                                },
                                                                {
                                                                    id: 4,
                                                                    name: '2',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],
                                                                    
                                                                },
                                                                {
                                                                    id: 5,
                                                                    name: '3',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],
                                                                   
                                                                },
                                                            ],
                                                        },
                                                    ],}
                                            },
                                            {
                                                key: 'tab2',
                                                children: '摘要1',
                                            },
                                        ],
                                    },
                                },
                                
                            },
                        },
                        {
                            component: 'AnchorContent',
                            key: 'div2',
                            attrs: {
                                style: {
                                    height: '500px',
                                },
                            },
                            children: {
                                component: 'Panel',
                                header: {
                                    styles: {
                                        justify: 'between',
                                    },
                                    caption: {
                                        title: '锚点标题2',
                                    },
                                    tools: [
                                        {
                                            component: 'TabList',
                                            tabContent: () => {
                                                return tabContent2
                                            },
                                            selectedItems: 'tab3',
                                            items: [
                                                {
                                                    key: 'tab3',
                                                    text: '基本信息',
                                                },
                                                {
                                                    key: 'tab4',
                                                    text: '方案摘要',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                body: {
                                    children: {
                                        component: 'TabContent',
                                        ref: (c) => {
                                            tabContent2 = c
                                        },
                                        selectedPanel: 'tab3',

                                        panels: [
                                            {
                                                key: 'tab3',
                                                children: {
                                                    component: 'Rows',
                                                    gutter: 'md',
                                                    items: [

                                                        {
                                                            component: 'Grid',
                                                            ref: (c) => {
                                                                table = c
                                                            },
                                                            columns: [
                                                                {
                                                                    field: 'name',
                                                                    title: '序号',
                                                                },
                                                                {
                                                                    field: 'author',
                                                                    title: '文件夹名',
                                                                    
                                                                },
                                                                {
                                                                    field: 'role',
                                                                    title: '备注',
                                                                    
                                                                },
                                                                {
                                                                    field: 'tags',
                                                                    title: '操作',
                                                                
                                                                    render: function (tags) {
                                                                        const tagItems = tags.map(function (tag) {
                                                                            return {
                                                                                tagobj: tag,
                                                                            }
                                                                        })
                                                                        return {
                                                                            component: 'List',
                                                                            gutter: 'md',
                                                                            items: tagItems,
                                                                            itemDefaults: {
                                                                                styles: {
                                                                                    border: '1px',
                                                                                    padding: ['x-1', 'y-d125'],
                                                                                },
                                                                                _config: function () {
                                                                                    return this.setProps({
                                                                                        children: this.props.tagobj,
                                                                                    })
                                                                                },
                                                                            },
                                                                        }
                                                                    },
                                                                },
                                                            ],
                                                            data: [
                                                                {
                                                                    id: 1,
                                                                    name: '1',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                                {
                                                                    id: 4,
                                                                    name: '2',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                                {
                                                                    id: 5,
                                                                    name: '3',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                            ],
                                                        },
                                                    ],
                                                }
                                            },
                                            {
                                                key: 'tab4',
                                                children: '方案摘要2',
                                            },
                                        ],
                                    },
                                },

                            },
                        },

                        {
                            component: 'AnchorContent',
                            key: 'div3',
                            attrs: {
                                style: {
                                    height: '500px',
                                },
                            },
                            children: {
                                component: 'Panel',
                                header: {
                                    styles: {
                                        justify: 'between',
                                    },
                                    caption: {
                                        title: '锚点标题3',
                                    },
                                    tools: [
                                        {
                                            component: 'TabList',
                                            tabContent: () => {
                                                return tabContent3
                                            },
                                            selectedItems: 'tab5',
                                            items: [
                                                {
                                                    key: 'tab5',
                                                    text: '基本信息',
                                                },
                                                {
                                                    key: 'tab6',
                                                    text: '方案摘要',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                body: {
                                    children: {
                                        component: 'TabContent',
                                        ref: (c) => {
                                            tabContent3 = c
                                        },
                                        selectedPanel: 'tab5',

                                        panels: [
                                            {
                                                key: 'tab5',
                                                children: {
                                                    component: 'Rows',
                                                    gutter: 'md',
                                                    items: [

                                                        {
                                                            component: 'Grid',
                                                            ref: (c) => {
                                                                table = c
                                                            },
                                                            columns: [
                                                                {
                                                                    field: 'name',
                                                                    title: '序号',
                                                                },
                                                                {
                                                                    field: 'author',
                                                                    title: '文件夹名',

                                                                },
                                                                {
                                                                    field: 'role',
                                                                    title: '备注',

                                                                },
                                                                {
                                                                    field: 'tags',
                                                                    title: '操作',

                                                                    render: function (tags) {
                                                                        const tagItems = tags.map(function (tag) {
                                                                            return {
                                                                                tagobj: tag,
                                                                            }
                                                                        })
                                                                        return {
                                                                            component: 'List',
                                                                            gutter: 'md',
                                                                            items: tagItems,
                                                                            itemDefaults: {
                                                                                styles: {
                                                                                    border: '1px',
                                                                                    padding: ['x-1', 'y-d125'],
                                                                                },
                                                                                _config: function () {
                                                                                    return this.setProps({
                                                                                        children: this.props.tagobj,
                                                                                    })
                                                                                },
                                                                            },
                                                                        }
                                                                    },
                                                                },
                                                            ],
                                                            data: [
                                                                {
                                                                    id: 1,
                                                                    name: '1',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                                {
                                                                    id: 4,
                                                                    name: '2',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                                {
                                                                    id: 5,
                                                                    name: '3',
                                                                    author: '研究者手册',
                                                                    role: '样本文件',
                                                                    tags: ['编辑', '删除'],

                                                                },
                                                            ],
                                                        },
                                                    ],
                                                }
                                            },
                                            {
                                                key: 'tab6',
                                                children: '方案摘要3',
                                            },
                                        ],
                                    },
                                },

                            },
                        },
                       
                    ],
                },
            ],
        },
    }
});