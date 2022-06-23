define([], function () {
    return function () {
        const title = "机构数据库-WeTrial";

        var orgcount = 0;
        let applyRef, gridlistRef, leadernameRef, leaderorgRef, searchtextRef;

        const user = nomapp.context.User;

        return {
            title: title,
            view: {
                attrs: {
                    id: "Content",
                },
                children: [
                    {
                        component: "List",
                        gutter: "md",
                        wrappers: [
                            {
                                span: 12,
                                item: {
                                    component: 'Group',
                                    classes: {
                                        simplegroup: true
                                    },
                                    fields: [{
                                        component: 'Textbox',
                                        ref: (c) => {
                                            searchtextRef = c
                                        },
                                        name: 'simplesearch',
                                        span: '7',
                                        placeholder: '请输入机构名称、适应症、药物名称',
                                        classes: {
                                            simpletext: true
                                        },
                                        button: {
                                            rightIcon: 'search',
                                            onClick: () => {
                                                let formParams = searchtextRef.getValue();
                                                if (formParams==null) {
                                                    formParams = "";
                                                }
                                                window.location.href = `#!research/center?SearchText=${formParams}`;

                                            },
                                        },
                                        onEnter: (args) => {
                                            let formParams = searchtextRef.getValue();
                                            if (formParams == null) {
                                                formParams = "";
                                            }
                                            window.location.href = `#!research/center?SearchText=${formParams}`;

                                        }
                                    }],
                                },
                            },
                            {
                                span: 9,
                                item: {
                                    component: "Panel",
                                    header: {
                                        ref: c => applyRef = c,
                                        caption: {
                                            title: ``,
                                        },

                                        nav: {},

                                        tools: [
                                            {
                                                component: "Button",
                                                type: 'link',
                                                text: "更多>>",
                                                attrs: {
                                                    style: {
                                                        fontSize: '14px',
                                                    }
                                                },
                                                href: `#!research/applyproj`,
                                            },
                                        ],
                                    },
                                    body: {
                                        children: {
                                            component: 'List',
                                            ref: (c) => {
                                                gridlistRef = c
                                            },
                                            gutter: 'md',
                                            line: 'grid',
                                            cols: 1,

                                            _created: function () {
                                                var arrs = new Array();
                                                axios.get(`/api/institution-db/institution/by-org/get-proj-apply`, { loading: true })
                                                    .then((response) => {
                                                        var href = '';
                                                        for (var i = 0; i < response.length; i++) {
                                                            if (response[i].isSBFCreateProject == "True") {
                                                                if (response[i].siteLogo == null) {
                                                                    response[i].siteLogo = '/Assets/img/jg.png';
                                                                }
                                                                arrs.push(response[i]);
                                                                orgcount = arrs.length;
                                                            }
                                                        }

                                                        gridlistRef.update({
                                                            items: arrs.slice(0, 5).map(item => (
                                                                {
                                                                    component: 'Cols',
                                                                    strechIndex: 1,
                                                                    items: [{
                                                                        tag: "img",
                                                                        attrs: {
                                                                            src: item.siteLogo,
                                                                            style: {
                                                                                width: "43px",
                                                                                height: "43px",
                                                                            }
                                                                        },
                                                                    },
                                                                    {
                                                                        component: 'Rows',
                                                                        items: [{
                                                                            component: 'Cols',
                                                                            children: [
                                                                                {
                                                                                    tag: "a",
                                                                                    attrs: {
                                                                                        href: `#!research/organizedetail?SiteId=${item.id}&v=${new Date().getTime()}`,
                                                                                        style: {
                                                                                            'font-size': '16px',
                                                                                            'font-weight': 'bold',
                                                                                            'color':'#495057',
                                                                                        },
                                                                                    },

                                                                                    children: item.studySiteName,
                                                                                },
                                                                                item.levelName !== null && {
                                                                                    children: {
                                                                                        component: 'Tag',
                                                                                        size: 'xs',
                                                                                        text: item.levelName,
                                                                                        color: 'yellow',
                                                                                    }

                                                                                },
                                                                                item.recordNo != null && {
                                                                                    children: {
                                                                                        component: 'Tag',
                                                                                        size: 'xs',
                                                                                        text: '药物备案',
                                                                                        color: 'olive',
                                                                                    }
                                                                                },
                                                                                item.isPhaseOne == true && {
                                                                                    children: {
                                                                                        component: 'Tag',
                                                                                        size: 'xs',
                                                                                        text: 'I期基地',
                                                                                        color: 'green',
                                                                                    }
                                                                                },
                                                                                item.isInstrument == true && {
                                                                                    children: {
                                                                                        component: 'Tag',
                                                                                        size: 'xs',
                                                                                        text: '机械备案',
                                                                                        color: 'teal',
                                                                                    }
                                                                                },
                                                                            ]

                                                                        },
                                                                        {
                                                                            tag: 'div',
                                                                            children: [{
                                                                                tag: 'span',
                                                                                children: `进行中 ${item.projectingCount}`
                                                                            },
                                                                            {
                                                                                tag: 'span',
                                                                                attrs: {
                                                                                    style: {
                                                                                        marginLeft: '10px',
                                                                                    }
                                                                                },
                                                                                children: `牵头 ${item.teamLeaderCount}`
                                                                            }],

                                                                        }],

                                                                    },
                                                                    {
                                                                        component: 'Button',
                                                                        text: '项目申请',
                                                                        onClick: (args) => {
                                                                            if (user == null) {
                                                                                //未登录跳到登录页面：
                                                                                localStorage.setItem("lasturl", window.location.href);
                                                                                href = '/Account/Login/#institutiondb';
                                                                            }
                                                                            else if (item.platformProjectCount == 0) {
                                                                                href = `/Member/Project/GuidePage?oid=${item.id}&isScienceLogin=0`;
                                                                            }
                                                                            else {
                                                                                href = `/Member/Project/Index?oid=${item.id}&isScienceLogin=0`;
                                                                            }
                                                                            window.location.href = href;
                                                                        },
                                                                    }],
                                                                }))
                                                        });

                                                        applyRef.update({
                                                            caption: {
                                                                //title: `在线项目申请  ${orgcount}家机构免费在线申请`,
                                                                title: {
                                                                    children: [{
                                                                        tag: 'span',
                                                                        attrs: {
                                                                            style: {
                                                                                //color: 'red',
                                                                                marginRight:'3px',
                                                                                'font-size':'22px',
                                                                            }
                                                                        },
                                                                        children: `${orgcount}`
                                                                    },
                                                                    {
                                                                        tag: 'span',
                                                                       
                                                                        children: `家机构免费在线项目申请`
                                                                    }]
                                                                }

                                                            }
                                                        });

                                                    })
                                            },

                                        },
                                    },
                                },
                            },


                            {
                                span: 3,
                                item: {
                                    component: "Panel",
                                    attrs: {
                                        style: {
                                            height: '100%',
                                        }
                                    },
                                    header: {
                                        caption: {
                                            title: "推荐机构",
                                        },
                                        nav: {},
                                        tools: [
                                            {
                                                component: "Button",
                                                type: 'link',
                                                text: "更多>>",
                                                href: `#!research/center`,
                                            },
                                        ],
                                    },
                                    body: {
                                        children: {
                                            component: 'List',
                                            ref: (c) => {
                                                listRef = c
                                            },
                                            gutter: 'md',
                                            cols: 1,
                                            _created: function () {
                                                axios.get(`/api/institution-db/institution/by-org/get-recommend-org`, { loading: true })
                                                    .then((response) => {
                                                        listRef.update({
                                                            items: response.map(item => (
                                                                {
                                                                    component: 'Cols',
                                                                    attrs: {
                                                                        style: {
                                                                            lineHeight: '1.6rem',
                                                                        }
                                                                    },
                                                                    items: [{ tag: 'a', children: item.studySiteName }],
                                                                    onClick: () => {
                                                                        window.location.href = `#!research/organizedetail?SiteId=${item.id}&v=${new Date().getTime()}`;
                                                                    },
                                                                }))
                                                        });
                                                    })
                                            }
                                        },
                                    },
                                },
                            },

                            {
                                span: 12,
                                item: {
                                    component: "Panel",
                                    header: {
                                        caption: {
                                            title: "临床试验最新公示",
                                        },
                                        nav: {},
                                        tools: [
                                            {
                                                component: "Button",
                                                type: 'link',
                                                text: "更多>>",
                                                href: `#!research/center?view=2`,
                                            },
                                        ],
                                    },
                                    body: {
                                        component: "Rows",
                                        styles: {
                                            padding: 1,
                                        },
                                        items: [
                                            {
                                                component: "Grid",
                                                columnResizable: true,
                                                line: "both",
                                                ellipsis: 'both',
                                                sticky: true,
                                                columns: [
                                                    {
                                                        field: 'registrationNo',
                                                        title: '登记号',
                                                        width: 110,
                                                        cellRender: (args) => {
                                                            return {
                                                                tag: 'a',
                                                                attrs: {
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=index',
                                                                },
                                                                children: args.rowData.registrationNo
                                                            }
                                                        }
                                                    },
                                                    {
                                                        field: 'popularTitle',
                                                        title: '试验名称',
                                                        //ellipsis: true,
                                                        cellRender: (args) => {
                                                            return {
                                                                tag: 'a',
                                                                attrs: {
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=index',
                                                                    title: args.rowData.popularTitle,
                                                                },
                                                                //tooltip: args.rowData.popularTitle,
                                                                children: args.rowData.popularTitle
                                                            }
                                                        }
                                                    },
                                                    {
                                                        field: 'drugName',
                                                        title: '研究药物',

                                                    },
                                                    {
                                                        field: 'indication',
                                                        title: '适应症',
                                                        //ellipsis: true,

                                                    },
                                                    {
                                                        field: 'leadername',
                                                        title: '牵头研究者',
                                                        width: 90,
                                                        cellRender: (args) => {
                                                            if (args.rowData.leadername != null && args.rowData.id != null && args.rowData.piid != null) {
                                                                var leadernameArry = args.rowData.leadername.split(",");
                                                                var siteArry = args.rowData.id.split(",");
                                                                var piArry = args.rowData.piid.split(",");
                                                                if (leadernameArry.length > 1 && siteArry.length > 1 && piArry.length > 1) {
                                                                    return {
                                                                        component: 'Select',
                                                                        ref: c => {
                                                                            leadernameRef = c
                                                                        },
                                                                        value: 0,
                                                                        options: leadernameArry.map((item, index) => (
                                                                            {
                                                                                text: item, value: index,
                                                                            })),

                                                                        onValueChange: function (e) {
                                                                            window.location.href = `#!research/resdetail/?SiteId=${siteArry[e.newValue]}&PIId=${piArry[e.newValue]}`
                                                                        }

                                                                    }
                                                                }

                                                                else {
                                                                    return {
                                                                        tag: 'a',
                                                                        attrs: {
                                                                            href: `#!research/resdetail/?SiteId=${args.rowData.id}&PIId=${args.rowData.piid}`
                                                                        },
                                                                        children: args.rowData.leadername,
                                                                    }
                                                                }

                                                            }

                                                        }
                                                    },
                                                    {
                                                        field: 'sponsorName',
                                                        title: '申办方',
                                                        //ellipsis: true,

                                                    },
                                                    {
                                                        field: 'leaderorgname',
                                                        title: '牵头单位',
                                                        //ellipsis: true,

                                                        cellRender: (args) => {
                                                            if (args.rowData.leaderorgname != null && args.rowData.id != null) {
                                                                var leaderorgnameArry = args.rowData.leaderorgname.split(",");
                                                                var siteArry = args.rowData.id.split(",");

                                                                if (leaderorgnameArry.length > 1 && siteArry.length > 1) {
                                                                    return {
                                                                        component: 'Select',
                                                                        value: 0,
                                                                        options: leaderorgnameArry.map((item, index) => (
                                                                            {
                                                                                text: item, value: index,
                                                                            })),

                                                                        onValueChange: function (e) {
                                                                            window.location.href = `#!research/organizedetail/?SiteId=${siteArry[e.newValue]}&v=${new Date().getTime()}`
                                                                        }

                                                                    }
                                                                }

                                                                else {
                                                                    return {
                                                                        tag: 'a',
                                                                        attrs: {
                                                                            title: args.rowData.leaderorgname,
                                                                            href: `#!research/organizedetail/?SiteId=${args.rowData.id}&v=${new Date().getTime()}`
                                                                        },
                                                                        children: args.rowData.leaderorgname,
                                                                    }
                                                                }

                                                            }

                                                        }
                                                    },
                                                    {
                                                        field: 'studyPhase',
                                                        title: '试验分期',

                                                    },
                                                    {
                                                        field: 'publishedDate',
                                                        width: 110,
                                                        title: '首次公示日期'
                                                    },
                                                    {
                                                        field: 'studyStatus',
                                                        title: '试验状态'
                                                    }
                                                ],
                                                _created: function () {
                                                    const listUrl = `/api/institution-db/institution/by-org/get-clinical-trials`;
                                                    let trials = this;
                                                    axios
                                                        .get(listUrl, {
                                                            params: {
                                                                pageindex: 1,
                                                                pagesize: 10,
                                                            },
                                                        })
                                                        .then((res) => {
                                                            if (res) {
                                                                trials.update({ data: res.items });
                                                            }
                                                        });
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        };
    };
});
