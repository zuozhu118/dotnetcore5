define([], function () {

    let gridRef,
        breadRef,
        pagerRef;
    const user = nomapp.context.User;
    const asyncSearchCenterProject = (params) => {
        const searchParams = { ...params }
        let pageindex = searchParams.PageIndex;
        let pagesize = searchParams.PageSize;
        axios.get(`/api/institution-db/institution/by-org/get-proj-apply`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage} = response;
                var href = '';
                var arrs = new Array();
                for (var i = 0; i < response.length; i++) {
                    if (response[i].isSBFCreateProject == "True") {
                        if (response[i].siteLogo == null) {
                            response[i].siteLogo = '/Assets/img/jg.png';
                        }
                        arrs.push(response[i]);  
                    }
                }
                gridRef.update({
                    items: arrs.slice((pageindex - 1) * pagesize, pageindex * pagesize).map(item => (
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
                                                href: `#!research/organizedetail/?SiteId=${item.id}`,
                                            },

                                            children: item.studySiteName,
                                        },
                                        item.levelName !== null && {
                                            children: {
                                                component: 'Tag',
                                                text: item.levelName,
                                                color: 'yellow',
                                            }

                                        },
                                        item.recordNo != null && {
                                            children: {
                                                component: 'Tag',
                                                text: '药物备案',
                                                color: 'olive',
                                            }
                                        },
                                        item.isPhaseOne == true && {
                                            children: {
                                                component: 'Tag',
                                                text: 'I期基地',
                                                color: 'green',
                                            }
                                        },
                                        item.isInstrument == true && {
                                            children: {
                                                component: 'Tag',
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
                                        href = `/Member/Project/GuidePage/?oid=${item.id}&isScienceLogin=0`;
                                    }
                                    else {
                                        href = `/Member/Project/Index/?oid=${item.id}&isScienceLogin=0`;
                                    }
                                    window.location.href = href;
                                },
                            }],
                        }))
                });
                pagerRef.update({ totalCount: arrs.length, pageIndex: currentPage });
            })
    }

    return function () {
        return {
            title: '在线项目申请-机构数据库-WeTrial',
            view: {
                component: 'Rows',
                ref: c => {
                    layoutRef = c
                },
                styles: {
                    color: 'white',
                },
                items: [
                    {
                        component: 'Breadcrumb',
                        items: [{
                            text: '首页',
                            url: '#!dashboard'
                        },
                        {
                            text: '项目申请',
                        }],
                        ref: c => {
                            breadRef = c
                        }
                    },
                    {
                        component: 'List',
                        ref: (c) => {
                            gridRef = c
                        },
                        gutter: 'md',
                        line: 'grid',
                        cols: 1,
                    },
                    {
                        component: 'Pager',
                        ref: (c) => (pagerRef = c),
                        onPageChange: function (e) {
                            const pagerParams = pagerRef.getPageParams()
                            asyncSearchCenterProject({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                        }
                    }

                ],
                _rendered: () => {
                    asyncSearchCenterProject({ PageIndex: 1, PageSize: 10 });
                }
            }
        }
    }

});

