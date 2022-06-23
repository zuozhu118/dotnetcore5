//机构详情
define(["wetrial-chart", "utils"], function (WetrialChart, utils) {

    let mainsearchRef, orgpersonRef, orgbasicRef,
        orgcwRef, ethicRef, ethicpersonRef,
        ethiccwRef, inheritanceRef, majorRef,
        majorbaRef, commentref, updateuserRef,
        pageremajorRef, chartref, updatetimeRef,
        columyearRef, lineyearRef, colummonthRef,
        pagerRef, breadRef, pagerorgRef, linemonthRef,
        pagerethicRef, searchpagerRef, strrecordDate,
        cedprojRef, personRef, gridRef3,
        gridRef4, pagerRef3, pagerRef4,
        searchtextRef, ssuRef, ruzurowRef,
        teststatusRef, drugRef, teststageRef,
        classifyRef, gridtestRef, projapplyUrl,
        applybtnRef, strisEthicalMutual, ruzuRef,
        strisPreEthical, modalgridRef, pagermodelgridRef,
        firsttextareaRef, firstpublishRef, comitemRef,
        topindicationRef, organchorRef,
        comlisthideRef, strreplyRef, sumcomment = 0;
    let rate = '';
    let orgname = '';
    let chartcount = 0;
    const data = [];
    const yeardata = [];
    const monthdata = [];
    let selectedtab;
    let isPC = sdscom.utils.isPCorMob() || '';
    let isHide = ''
    if (isPC != 'pc') {
        isHide = 'display:none;'; //如果不是pc端则隐藏按钮
    }
    let sitePkid = '', ecPkid = '', geneticPkid = '';
    // let getTabView = sdscom.utils.getTabView;
    let query;
    const user = nomapp.context.User;

    // let url_tag = '../../orgFileManage/lx-fileList';
    let defulatFunctionName = 'ApplyProjectDrug';
    let fileToken, fileWebAPIUrl;
    let encryptFile = sdscom.utils.encryptFile;
    // let getFileDataGridDom = sdscom.utils.getFileDataGridDom;
    let getFileDataDeployGridDom = sdscom.utils.getFileDataDeployGridDom;

    let firstSelectLl = false, firstSelectYcb = false;
    return function () {
        let fileDataLoad_paras_jg = [];
        let fileDataLoad_paras_ll = [];
        let fileDataLoad_paras_ycb = [];
        firstSelectLl = false;
        firstSelectYcb = false;
        query = this.$route.query;
        const user = nomapp.context.User;
        orgId = query.SiteId;
        // orgId = '526337254121701595';
        const asyncSearchCenterProject = function (params) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-clinical-detail`, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    gridtestRef.update({ data: items })
                    pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });
                    //项目数为0显示暂无数据：
                    if (totalItems == 0) {
                        chartref.hide();
                        emptyRef.show();
                    }
                    else {
                        chartref.show();
                        emptyRef.hide();
                    }
                })
        }

        //非WT合作机构SSU时长：
        const asyncNotWTSSU = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-notwt-ssu`, { params: searchParams })
                .then(response => {
                    ssuRef.update({ data: response })
                })
        }

        //WT合作机构SSU时长：
        const asyncWTSSU = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-wt-ssu`, { params: searchParams })
                .then(response => {
                    ssuRef.update({ data: response })
                })
        }

        const asyncHeadDetail = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-orghead-detail`, { params: searchParams })
                .then(response => {

                    if (response.items.length > 0) {
                        const { address, webLink, studySiteName, recordNo, levelName, platformProjectCount, id, isPhaseOne, isInstrument, isActive, isSite, isSBFCreateProject } = response.items[0];
                        var beian = null;
                        if (recordNo != null) {
                            beian = '药物备案';
                        }
                        var jixie = null;
                        if (isInstrument == true) {
                            jixie = '机械备案';
                        }
                        var jidi = null;
                        if (isPhaseOne == true) {
                            jidi = 'I期基地';
                        }

                        if (platformProjectCount == -1) {
                            //未登录跳到登录页面：
                            projapplyUrl = '/Account/Login/#institutiondb';
                        }
                        else if (platformProjectCount == 0) {
                            projapplyUrl = `/Member/Project/GuidePage/?oid=${id}&isScienceLogin=0`;
                        }
                        else {
                            projapplyUrl = `/Member/Project/Index/?oid=${id}&isScienceLogin=0`;
                        }


                        //WT合作机构：
                        if (isActive == true && isSite == true && isSBFCreateProject == "True") {
                            applybtnRef.show();
                            applybtnRef.update({
                                onClick: function () {
                                    window.location.href = projapplyUrl;
                                }
                            });

                            asyncWTSSU();
                        }
                        //WT非合作机构
                        else {
                            applybtnRef.hide();

                            asyncNotWTSSU();
                        }
                        orgname = studySiteName;
                        let titles = studySiteName + "-机构数据库-WeTrial";
                        document.title = titles;

                        personRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    children: [
                                        {
                                            tag: "span",
                                            children: studySiteName,
                                            attrs: {
                                                style: {
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                }
                                            }
                                        },
                                        levelName !== null && {
                                            children: {
                                                component: 'Tag',
                                                size: 'xs',
                                                text: levelName,
                                                color: 'yellow',
                                            }

                                        },
                                        beian !== null && {
                                            children: {
                                                component: 'Tag',
                                                size: 'xs',
                                                text: beian,
                                                color: 'olive',
                                            }
                                        },
                                        jidi !== null && {
                                            children: {
                                                component: 'Tag',
                                                size: 'xs',
                                                text: jidi,
                                                color: 'green',
                                            }
                                        },
                                        jixie !== null && {
                                            children: {
                                                component: 'Tag',
                                                size: 'xs',
                                                text: jixie,
                                                color: 'teal',
                                            }
                                        },
                                    ]
                                }
                            }, {
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            tag: "span",
                                            children: address,
                                        },
                                    ]
                                }
                            },
                            {

                                tag: 'a',
                                attrs: {
                                    href: webLink,
                                    target: '_blank',
                                },
                                children: webLink,
                            }]
                        })

                        //面包屑导航：
                        breadRef.update({
                            items: [{
                                text: '找中心',
                                url: '#!research/center'
                            },
                            {
                                text: studySiteName,
                            }]
                        });

                        //处理第一个发布评论头像：
                        if (user != null) {
                            firstpublishRef.update({ attrs: { src: `/My/Account/Avatar/${nomapp.context.User.Id}_s` } });
                        }
                    }
                })
        }

        const formatTime = function (strdate) {
            let today = new Date();
            let diff = today - new Date(strdate);
            let difdays = Math.floor(diff / (24 * 3600 * 1000));
            let difhours = Math.floor(diff / (3600 * 1000));
            let difmins = Math.floor(diff / (60 * 1000));
            let difseconds = Math.floor(diff / 1000);
            if (difdays >= 1) {
                let index = strdate.lastIndexOf(":");
                strdate = strdate.substring(0, index);
                return strdate;
            }
            else {
                if (difhours >= 1) {
                    return `${difhours}小时前`;
                }
                else {
                    if (difmins >= 1) {
                        return `${difmins}分钟前`;
                    }
                    else {
                        return '刚刚';
                    }
                }
            }
        }

        const asyncOrgUpdatedTime = function () {
            const searchParams = { ...query }
            let strdate = '';
            axios.get(`/api/institutiondb/center/by-org/get-org-updatedtime`, { params: searchParams })
                .then(response => {
                    if (response[0].updatedTime != null) {
                        strdate = response[0].updatedTime.replace('T', ' ');
                        let formattime = formatTime(strdate);
                        updatetimeRef.update({ children: `更新时间：${formattime}` });
                    }

                })
        }

        const asyncOrgUpdatedUser = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-org-updateduser`, { params: searchParams })
                .then(response => {
                    let str = "";
                    if (response.length > 0 && response.length <= 5) {
                        for (var i = 0; i < response.length; i++) {
                            str += response[i].name + '、'
                        }
                        let lastindex = str.lastIndexOf("、");
                        str = str.substring(0, lastindex);
                        updateuserRef.update({ children: `#该机构数据由<span style='color:#ed9c5d'>${str}</span>认领维护` });

                    }
                    else if (response.length > 5) {
                        for (var i = 0; i < 5; i++) {
                            str += response[i].name + '、'
                        }
                        let lastindex = str.lastIndexOf("、");
                        str = str.substring(0, lastindex);
                        str += '等';
                        updateuserRef.update({ children: `#该机构数据由<span style='color:#ed9c5d'>${str}</span>认领维护` });
                    }
                })
        }

        const asyncOrgBasicList = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-orgbasic-list`, { params: searchParams })
                .then(response => {
                    if (response.items.length > 0) {
                        const { siteAddress, subDomain, isActive, siteLink, contacts, contactPhone, receiveTime, fax, email, recordNo, recordDate, latelyRecordDate, fI_Fullname, fI_Account, fI_Bank } = response.items[0];
                        if (recordDate != null) {
                            var index = recordDate.indexOf('T');
                            strrecordDate = recordDate.substr(0, index);
                        }
                        let orglink = siteLink;
                        let cururl = window.location.hostname;
                        //已激活机构
                        if (isActive == true) {
                            if (subDomain==null) {
                                orglink = '';
                            }
                            else {
                                orglink = window.location.protocol + '//' + cururl.replace('www', subDomain);
                            }
                            
                        }

                        orgbasicRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {
                                            children: '基本信息',
                                        },

                                    ]
                                }
                            },
                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    }
                                },
                                cols: 1,
                                items: [
                                    {
                                        children: {
                                            component: 'Cols',
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '机构地址',
                                                },
                                                {
                                                    tag: "span",
                                                    children: siteAddress,
                                                },
                                            ],
                                            strechIndex: 1,
                                            data_edit: { field: 'SiteAddress', text: '机构地址' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '机构网址',
                                                },
                                                {
                                                    tag: "a",
                                                    attrs: {
                                                        target: '_blank',
                                                        href: orglink
                                                    },
                                                    children: orglink,
                                                },
                                            ],
                                            strechIndex: 1,
                                            data_edit: { field: 'siteLink', text: '机构网址' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '联系人',
                                                },
                                                {
                                                    tag: "span",
                                                    children: contacts,
                                                },
                                            ],
                                            strechIndex: 1,
                                            data_edit: { field: 'Contacts', text: '联系人' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '联系方式',
                                                },
                                                {
                                                    tag: "span",
                                                    children: contactPhone,
                                                },
                                            ],
                                            data_edit: { field: 'ContactPhone', text: '联系方式' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '接待时间',
                                                },
                                                {
                                                    tag: "span",
                                                    children: receiveTime,
                                                },
                                            ],
                                            data_edit: { field: 'ReceiveTime', text: '接待时间' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '机构传真',
                                                },
                                                {
                                                    tag: "span",
                                                    children: fax,
                                                },
                                            ],
                                            data_edit: { field: 'Fax', text: '机构传真' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '机构邮箱',
                                                },
                                                {
                                                    tag: "span",
                                                    children: email,
                                                },
                                            ],
                                            data_edit: { field: 'Email', text: '机构邮箱' }
                                        }
                                    }, {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '备案信息',
                                                },
                                                {
                                                    tag: "span",
                                                    children: recordNo,
                                                },
                                            ],
                                            data_edit: { field: 'RecordNo', text: '备案信息' }
                                        }
                                    }, {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '首次备案',
                                                },
                                                {
                                                    tag: "span",
                                                    children: strrecordDate,
                                                },
                                            ],
                                            data_edit: { field: 'RecordDate', text: '首次备案' }
                                        }
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: "span",
                                                    children: '备案时间',
                                                },
                                                {
                                                    tag: "span",
                                                    children: latelyRecordDate,
                                                },
                                            ],
                                            data_edit: { field: 'LatelyRecordDate', text: '备案时间' }
                                        }
                                    },
                                    {
                                        ref: (c) => (ruzurowRef = c),
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            ref: (c) => (ruzuRef = c),
                                            onCreated() {
                                                asyncEnrollRate();
                                            },
                                        }
                                    },

                                ],
                            },
                            ]
                        })
                        orgcwRef.update({
                            items: [{
                                attrs: {
                                    style: {
                                        'margin-top': '15px'
                                    }
                                },
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {
                                            children: '财务信息',
                                        },
                                        {
                                            component: 'AnchorContent',
                                            key: 'key3',
                                        },

                                    ]
                                }
                            },

                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    }
                                },
                                cols: 1,
                                items: [{
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '单位信息',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Fullname,
                                            },
                                        ],
                                        strechIndex: 1,
                                        data_edit: { field: 'FI_Fullname', text: '单位信息' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '单位账号',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Account,
                                            },
                                        ],
                                        strechIndex: 1,
                                        data_edit: { field: 'FI_Account', text: '单位账号' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '开户行',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Bank,
                                            },
                                        ],
                                        strechIndex: 1,
                                        data_edit: { field: 'FI_Bank', text: '开户行' }
                                    }
                                }]

                            }
                            ]
                        })
                        asyncOrgPerson({ PageIndex: 1, PageSize: 10 }, orgpersonRef, pagerorgRef);
                    }
                });

        }

        const asyncethictabList = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-ethictab-list`, { params: searchParams })
                .then(response => {
                    if (response.items.length > 0) {
                        const { id, name, address, isEthicalMutual, isPreEthical, receiveTime, fax, email, feedbackTime, meetingTime, fI_Fullname, fI_Account, fI_Bank } = response.items[0];
                        if (isEthicalMutual == 1) {
                            strisEthicalMutual = '是';
                        }
                        else {
                            strisEthicalMutual = '否';
                        }

                        if (isPreEthical == 1) {
                            strisPreEthical = '是';
                        }
                        else {
                            strisPreEthical = '否';
                        }
                        ecPkid = id;
                        ethicRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {

                                            children: '基本信息',
                                        },

                                    ]
                                }
                            },

                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    }
                                },
                                cols: 1,
                                items: [{
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '伦理名称 ',
                                            },
                                            {
                                                tag: "span",
                                                children: name,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Name', text: '伦理名称' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '办公地址',
                                            },
                                            {
                                                tag: "span",
                                                children: address,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Address', text: '办公地址' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '接待时间',
                                            },
                                            {
                                                tag: "span",
                                                children: receiveTime,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'ReceiveTime', text: '接待时间' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '传真',
                                            },
                                            {
                                                tag: "span",
                                                children: fax,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Fax', text: '传真' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: ' 邮箱',
                                            },
                                            {
                                                tag: "span",
                                                children: email,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Email', text: '邮箱' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '伦理反馈时间',
                                            },
                                            {
                                                tag: "span",
                                                children: feedbackTime,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'FeedbackTime', text: '伦理反馈时间' }
                                    }
                                }, {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '伦理召开时间',
                                            },
                                            {
                                                tag: "span",
                                                children: meetingTime,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'MeetingTime', text: '伦理召开时间' }
                                    }
                                }, {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '是否有前置伦理审批',
                                            },
                                            {
                                                tag: "span",
                                                children: strisEthicalMutual,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'IsEthicalMutual', text: '是否有前置伦理审批', domtype: 'radio', fieldtype: 1 }
                                    }
                                },

                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '是否需要提供伦理批件',
                                            },
                                            {
                                                tag: "span",
                                                children: strisPreEthical,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'IsPreEthical', text: '是否需要提供伦理批件', domtype: 'radio', fieldtype: 1 }
                                    }
                                }]

                            }
                            ]
                        })
                        ethiccwRef.update({
                            items: [{
                                attrs: {
                                    style: {
                                        'margin-top': '15px'
                                    }
                                },
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {
                                            children: '伦理财务信息',
                                            //attrs: {
                                            //    style: {
                                            //        paddingTop: '10px',
                                            //    }
                                            //},
                                        },
                                        {
                                            component: 'AnchorContent',
                                            key: 'key6',
                                        },
                                    ]
                                }
                            },

                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    }
                                },
                                cols: 1,
                                items: [{
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '单位信息',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Fullname,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'FI_Fullname', text: '单位信息' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '单位账号',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Account,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'FI_Account', text: '单位账号' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '开户行',
                                            },
                                            {
                                                tag: "span",
                                                children: fI_Bank,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'FI_Bank', text: '开户行' }
                                    }
                                }
                                ]

                            }




                            ]
                        })

                        asyncEthicPerson({ PageIndex: 1, PageSize: 10 }, ethicpersonRef, pagerethicRef);


                    }
                })
            if (!firstSelectLl) {
                firstSelectLl = true;
                //getFileData(fileDataLoad_paras_ll);
                getEcTmpCategory();
            }
            //getFileData('Ethic_ApplyProjectDrug', llGridDom);
        }

        let innerheight = window.innerHeight - 360 + 'px';

        const asyncmajortabList = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-majortab-list`, { params: searchParams })
                .then(response => {
                    if (response.items.length > 0) {
                        const { certificationDept } = response.items[0];
                        majorRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {

                                            children: '认证专业',
                                        },
                                    ]
                                }
                            },
                            {
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            tag: "span",
                                            children: certificationDept,
                                        },
                                    ]
                                }
                            }]
                        })
                        asyncMajorList({ PageIndex: 1, PageSize: 10 }, majorbaRef, pageremajorRef);
                    }
                })
        }

        const asyncinheritancetabList = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-inheritancetab-list`, { params: searchParams })
                .then(response => {
                    if (response.items.length > 0) {
                        const { id, address, contacts, position, contactPhone, applicationTime, email, fax } = response.items[0];
                        geneticPkid = id;
                        inheritanceRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                        },
                                        {

                                            children: '基本信息',
                                        },
                                    ]
                                }
                            },

                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    }
                                },
                                cols: 1,
                                items: [{
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '办公地址',
                                            },
                                            {
                                                tag: "span",
                                                children: address,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Address', text: '机构地址' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '联系人',
                                            },
                                            {
                                                tag: "span",
                                                children: contacts,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Contacts', text: '联系人' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '联系电话',
                                            },
                                            {
                                                tag: "span",
                                                children: contactPhone,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'ContactPhone', text: '联系电话' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: ' 联系人职务',
                                            },
                                            {
                                                tag: "span",
                                                children: position,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Position', text: '联系人职务' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '申请所需时间',
                                            },
                                            {
                                                tag: "span",
                                                children: applicationTime,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'ApplicationTime', text: '申请所需时间' }
                                    }
                                }, {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: ' 邮箱 ',
                                            },
                                            {
                                                tag: "span",
                                                children: email,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Email', text: '邮箱' }
                                    }
                                },
                                {
                                    children: {
                                        component: 'Cols',
                                        items: [
                                            {
                                                tag: "span",
                                                children: '传真',
                                            },
                                            {
                                                tag: "span",
                                                children: fax,
                                            },
                                        ], strechIndex: 1, data_edit: { field: 'Fax', text: '传真' }
                                    }
                                }]
                            }]
                        })
                    }
                })
            if (!firstSelectYcb) {
                firstSelectYcb = true;
                getFileData(fileDataLoad_paras_ycb);
            }
            //getFileData('Genetic_1,Genetic_0,ProjectStart_NoGenRes', ycbGridDom);
        }

        const asyncMainSearch = function (params) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-orgdepart-detail`, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    mainsearchRef.update({ data: items })
                    searchpagerRef.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }

        const asyncOrgPerson = function (params, tabobj, pagertabobj) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-orgperson-list`, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    tabobj.update({ data: items })
                    pagertabobj.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }

        const asyncEthicPerson = function (params, tabobj, pagertabobj) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-ethicperson-list`, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    tabobj.update({ data: items })
                    pagertabobj.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }

        const asyncMajorList = function (params, tabobj) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-major-list`, { params: searchParams })
                .then(response => {
                    tabobj.update({
                        items: response.map(item => (
                            {
                                component: 'Cols',
                                attrs: {
                                    style: {
                                        'cursor': 'pointer'
                                    }
                                },
                                strechIndex: 0,
                                items: [{ tag: 'span', children: item.name }, { tag: 'span', children: item.cdeProjectCount == 0 ? 0 : item.cdeProjectCount }, { tag: 'icon', children: '>' }],
                                onClick: () => {
                                    window.location.href = `#!research/departdetail?SiteId=${item.studySiteId}&deptId=${item.deptId}`;
                                },
                            }))
                    })

                })
        }

        //弹框
        const showModal = (url, args) => {
            const modalRef = new nomui.Modal({
                size: 'large',
                content: {
                    component: 'Panel',
                    header: {
                        caption: {
                            title: '试验',
                        },
                    },
                    body: {
                        children: [
                            {
                                component: 'Rows',
                                items: [
                                    {
                                        component: 'Grid',
                                        ellipsis: 'both',
                                        attrs: {
                                            style: {
                                                height: innerheight,
                                            },
                                        },
                                        ref: c => {
                                            modalgridRef = c
                                        },
                                        columnResizable: true,
                                        columnsCustomizable: true,
                                        columns: [
                                            {
                                                title: '登记号',
                                                field: 'registrationNo',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        classes: {
                                                            vistedlink: true
                                                        },
                                                        attrs: {
                                                            target: '_blank',
                                                            title: args.rowData.registrationNo,
                                                            href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SiteId=' + orgId,
                                                        },
                                                        //onClick: () => {
                                                        //    modalRef.close();
                                                        //},
                                                        children: args.rowData.registrationNo
                                                    }
                                                }
                                            },
                                            {
                                                title: '试验名称',
                                                field: 'popularTitle',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        classes: {
                                                            vistedlink: true
                                                        },
                                                        attrs: {
                                                            target: '_blank',
                                                            title: args.rowData.popularTitle,
                                                            href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SiteId=' + orgId,
                                                        },
                                                        children: args.rowData.popularTitle
                                                    }
                                                }
                                            },
                                            {
                                                field: 'drugName',
                                                title: '研究药物'
                                            },
                                            {
                                                field: 'indication',
                                                title: '适应症'
                                            },
                                            {
                                                field: 'sponsorName',
                                                title: '申办方'
                                            },
                                            {
                                                field: 'studyPhase',
                                                title: '试验分期'
                                            },
                                            {
                                                field: 'publishedDate',
                                                title: '首次公示日期'
                                            },
                                            {
                                                field: 'studyStatus',
                                                title: '试验状态'
                                            },
                                        ]
                                    },
                                    {
                                        component: 'Pager',
                                        ref: (c) => (pagermodelgridRef = c),
                                        onPageChange: function () {
                                            const pagerParams = pagermodelgridRef.getPageParams()
                                            asyncModal({ url: url, PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize, ...args.rowData })
                                        }
                                    }

                                ],
                                onCreated: () => {
                                    asyncModal({ url: url, PageIndex: 1, PageSize: 10, ...args.rowData });
                                }
                            }],
                    },

                    footer: {
                        children: {
                            component: 'Button',
                            type: 'primary',
                            text: '关闭',
                            onClick({ sender }) {
                                sender.parent.parent.parent.parent.close()
                            }
                        }
                    }

                },
            })
        }
        const asyncModal = (params) => {
            const formParams = searchtextRef.getValue();
            const searchParams = { ...params, ...query, ...formParams }
            axios.get(searchParams.url, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    modalgridRef.update({ data: items })
                    pagermodelgridRef.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }


        const asyncSearchCenterProject3 = (params) => {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-orgsponsor-detail`, { params: searchParams })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    gridRef3.update({ data: items })
                    pagerRef3.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }

        const asyncSearchCenterProject4 = (params) => {
            const formParams = searchtextRef.getValue();
            const searchParams = { ...params, ...query, ...formParams }
            axios.get(`/api/institutiondb/center/get-indication-detail`, { params: searchParams, loading: true})
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    gridRef4.update({ data: items })
                    pagerRef4.update({ totalCount: totalItems, pageIndex: currentPage });
                })
        }

        const asyncTopIndication = (params) => {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/get-top-indication`, { params: searchParams })
                .then(response => {
                    let arry = [];
                    for (var i = 0; i < response.length; i++) {
                        arry.push(response[i].name);
                    }

                    if (arry.length > 0) {
                        topindicationRef.update({
                            items: [
                                {
                                    tag: 'img',
                                    attrs: {
                                        src: '/webapp/institutiondb/imgs/advantage.png',
                                        style: {
                                            width: '50px',
                                            position: 'relative',
                                            top: '3px'
                                        }
                                    },
                                },
                                {
                                    tag: 'p',
                                    children: `${arry.join('、')}`
                                },
                                {
                                    component: 'Button',
                                    text: '查看全部适应症',
                                    type: 'link',
                                    onClick: () => {

                                        organchorRef.scrollToKey('key1')
                                        tabRef.selectTab('tab7');

                                    },
                                }
                            ]
                        });
                    }
                    else {
                        topindicationRef.update({
                            items: [
                                {
                                    tag: 'img',
                                    attrs: {
                                        src: '/webapp/institutiondb/imgs/advantage.png',
                                        style: {
                                            width: '50px',
                                            position: 'relative',
                                            top: '3px'
                                        }
                                    },
                                },
                                {
                                    tag: 'h5',
                                    children: '暂无数据',
                                    attrs: {
                                        style: {
                                            color:'gray'
                                        }
                                    }
                                },

                            ]
                        });
                    }
                })
        }

        const asyncTestStatusChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststatus-chart`, { params: searchParams })
                .then(response => {

                    teststatusRef.changeData(response)

                })
        }

        const asyncTestStageChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststage-chart`, { params: searchParams })
                .then(response => {

                    teststageRef.changeData(response)

                })
        }

        const asyncDrugChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-drug-chart`, { params: searchParams })
                .then(response => {

                    drugRef.changeData(response)


                })
        }

        const asyncClassifyChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-classify-chart`, { params: searchParams })
                .then(response => {

                    classifyRef.changeData(response)


                })
        }

        let obj = {};
        const addstudyphaseYear = (response) => {
            yeardata.length = 0;
            if (response.length == 0) {
                return;
            }
            else {
                if (response.length > 5) {
                    const studyPhasearry = [];
                    for (var j = 0; j < response.length; j++) {
                        if (response[j].type == response[0].type) {
                            studyPhasearry.push(response[j].studyPhase);
                        }
                        else {
                            break;
                        }
                    }
                    if ($.inArray('I期', studyPhasearry) == -1) {
                        obj.type = response[0].type;
                        obj.chartCount = 0;
                        obj.studyPhase = 'I期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('II期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.type = response[0].type;
                        obj.chartCount = 0;
                        obj.studyPhase = 'II期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('III期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.type = response[0].type;
                        obj.chartCount = 0;
                        obj.studyPhase = 'III期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('IV期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.type = response[0].type;
                        obj.chartCount = 0;
                        obj.studyPhase = 'IV期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('其他', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.type = response[0].type;
                        obj.chartCount = 0;
                        obj.studyPhase = '其他';
                        yeardata.push(obj)
                    }
                }
            }

            for (var i = 0; i < response.length; i++) {
                obj = new Object();
                obj.type = response[i].type;
                obj.chartCount = response[i].chartCount;
                obj.studyPhase = response[i].studyPhase;
                if (response[i].type == response[0].type) {
                    yeardata.splice(response[i].chartSort, 0, obj);
                }
                else {
                    yeardata.push(obj);
                }

            }
        }

        const addstudyphaseMonth = (response) => {
            monthdata.length = 0;
            if (response.length == 0) {
                return;
            }
            else {
                if (response.length > 5) {
                    const studyPhasearry = [];
                    for (var j = 0; j < response.length; j++) {
                        if (response[j].name == response[0].name) {
                            studyPhasearry.push(response[j].studyPhase);
                        }
                        else {
                            break;
                        }
                    }
                    if ($.inArray('I期', studyPhasearry) == -1) {
                        obj.name = response[0].name;
                        obj.chartCount = 0;
                        obj.studyPhase = 'I期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('II期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.name = response[0].name;
                        obj.chartCount = 0;
                        obj.studyPhase = 'II期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('III期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.name = response[0].name;
                        obj.chartCount = 0;
                        obj.studyPhase = 'III期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('IV期', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.name = response[0].name;
                        obj.chartCount = 0;
                        obj.studyPhase = 'IV期';
                        yeardata.push(obj)
                    }
                    if ($.inArray('其他', studyPhasearry) == -1) {
                        obj = new Object();
                        obj.name = response[0].name;
                        obj.chartCount = 0;
                        obj.studyPhase = '其他';
                        yeardata.push(obj)
                    }
                }
            }

            for (var i = 0; i < response.length; i++) {
                obj = new Object();
                obj.name = response[i].name;
                obj.chartCount = response[i].chartCount;
                obj.studyPhase = response[i].studyPhase;
                if (response[i].name == response[0].name) {
                    monthdata.splice(response[i].chartSort, 0, obj);
                }
                else {
                    monthdata.push(obj);
                }
            }
        }

        const asyncYearChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-year-chart`, { params: searchParams })
                .then(response => {

                    addstudyphaseYear(response);
                    columyearRef.changeData(yeardata)
                    lineyearRef.changeData(yeardata)


                })
        }

        const asyncMonthChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-month-chart`, { params: searchParams })
                .then(response => {

                    addstudyphaseMonth(response);
                    colummonthRef.changeData(monthdata)
                    linemonthRef.changeData(monthdata)


                })
        }

        const countdown = () => {
            let myDate = new Date();
            let year = myDate.getFullYear();
            let month = myDate.getMonth() + 1;
            let date = myDate.getDate();

            let h = myDate.getHours();
            let m = myDate.getMinutes();
            let s = myDate.getSeconds();
            let now = year + getNow(month) + getNow(date) + getNow(h) + getNow(m) + getNow(s);
            return now;
        }

        const getNow = (s) => {
            return s < 10 ? '0' + s : s;
        }

        const handleExport = (params) => {
            if (user == null) {
                localStorage.setItem("lasturl", window.location.href);
                location.href = '/Account/Login/#institutiondb';
                return;
            }
            const curtime = countdown();
            const searchParams = { ...query, ...params }
            utils.downloadFile({
                url: `/api/institutiondb/center/by-org/export-org-clinical`,
                data: searchParams,
                ext: ".xlsx",
                name: "临研试验_" + curtime,
            });
        };

        //添加关注
        const addAttention = function (paras, callback) {
            axios.post('/api/institution-db/org-attentions/org-addorcancel-follow', paras)
                .then((res) => {
                    callback(res);
                });
        }

        const getUserOrgClaim = function () {
            if (!user || !query) return;
            let enty = { orgId: query.SiteId, userId: user.Id };
            axios.post('/api/institution-db/org-claims/user-org-claim', enty)
                .then((res) => {
                    if (res) {
                        if (res.status == 3) {
                            btnClaim.update({ text: '取消认领', icon: 'redflag-red', isClaim: true, claimId: res.id, claimStatus: res.status });
                        }
                        else {
                            //btnClaim.update({text:'等待审批',icon:'redflag',isClaim:false,claimId:res.claimId,disabled:true,});
                            btnClaim.update({ text: '我要认领', icon: 'redflag', isClaim: false, claimId: res.id, claimStatus: res.status });
                        }
                        // else{
                        //     btnClaim.update({text:'我要认领',icon:'redflag',isClaim:false,claimId:res.claimId,claimStatus:res.status});
                        // }
                    } else {
                        btnClaim.update({ text: '我要认领', icon: 'redflag', isClaim: false });
                    }
                });
        }

        const getUserOrgAtten = function () {
            if (!user || !query) return;
            let enty = { orgId: query.SiteId, userId: user.Id };
            axios.post('/api/institution-db/org-attentions/user-org-atten', enty)
                .then((res) => {
                    if (res && res.status == 1) {
                        btnAtten.update({ text: '已关注', icon: 'love-blue', isAtten: true, attenId: res.attenId })
                    } else {
                        btnAtten.update({ text: '关注', icon: 'love-nomal', isAtten: false });
                    }
                });
        }

        //获取tab的操作纠错对象
        const getHandleDom = function (_selectedtab) {
            let handleDom = [];
            switch (_selectedtab) {
                case 'tab0':
                    if (!orgbasicRef || !orgcwRef) {
                        console.log('无法获取机构下的纠错元素~');
                        return;
                    }
                    handleDom.push(orgbasicRef);
                    handleDom.push(orgcwRef);
                    break;
                case 'tab1':
                    if (!ethicRef || !ethiccwRef) {
                        console.log('无法获伦理下的纠错元素~');
                        return;
                    }
                    handleDom.push(ethicRef);
                    handleDom.push(ethiccwRef);
                    break;
                case 'tab3':
                    if (!inheritanceRef) {
                        console.log('无法获取遗传办下的纠错元素~');
                        return;
                    }
                    handleDom.push(inheritanceRef);
                    break;
            }
            return handleDom;
        }
        //完成纠错
        const completeEdit = function (_dom) {
            for (let item of _dom) {
                if (!item) {
                    console.log('操作元素不存在~');
                    continue;
                }
                let list = item.props.items[1].items;
                for (let i = 0; i < list.length - 1; i++) {
                    list[i].children.items.splice(list[i].children.items.length - 1, 1);
                }
                item.update({ props: item.props });
                btnEdit.update({ text: '我要纠错', isEditOn: false, isEditDom: '' });
            }

        }

        //打开修改页
        const openEditModal = function (_data) {
            new nomui.Modal({
                size: 'small',
                data: _data,
                content: '/webapp/institutiondb/personalCenter/orgCorrection.js',
            });
        }

        const btnEditClick = function (_dom) {
            if (_dom) {
                if (!_dom.data_edit) {
                    console.log('请检查_dom参数对象中是否包含data_edit属性~');
                    return;
                }
                if (!_dom.items || _dom.items.length < 2) {
                    console.log('请检查_dom参数对象中是否包含items子元素~');
                    return;
                }
                let data_edit = _dom.data_edit;
                let tabText;
                let _siteId = query && query.SiteId;
                let _pkid = '';
                switch (selectedtab) {
                    case 'tab0':
                        tabText = '机构';
                        _pkid = _siteId;
                        break;
                    case 'tab1':
                        tabText = '伦理';
                        _pkid = ecPkid;
                        break;
                    case 'tab3':
                        tabText = '遗传办';
                        _pkid = geneticPkid;
                        break;
                }
                if (!tabText) {
                    console.log('请检查，无法获取tab页签~');
                    return;
                }

                let _data = {
                    field: data_edit.field,
                    fieldtype: data_edit.fieldtype || 0,     //字段类型默认为0，如果是别的类型则要写入属性
                    text: data_edit.text,
                    domtype: data_edit.domtype || 'textbox',        //默认组件类型textbox
                    value: _dom.items && _dom.items[1] && _dom.items[1].children,
                    tabText: tabText,
                    siteId: _siteId,
                    pkid: _pkid
                }
                openEditModal(_data);
            } else {
                console.log('参数错误~,请排查_data是否为Cols对象');
            }

        }
        let callCount = -1;
        let defaultEcId = '';//默认伦理
        //获取文件数据
        function getFileData(obj_paras) {
            // console.log(obj_paras)
            // startDate = new Date();
            callCount++;
            let functionName, titleId, isEc, dom;
            if (callCount < obj_paras.length) {
                let paras = obj_paras[callCount];
                functionName = paras.functionName;
                titleId = paras.titleId;
                isEc = paras.isEc;
                dom = paras.dom;
            }
            else {
                callCount = -1;
                return;
            }

            let fileDataApiUrl = '/api/institution-db/files/get-filelist-org-name-v1?orgId=' + orgId + '&functionName=' + functionName;
            if (isEc) {
                fileDataApiUrl += '&isEc=' + isEc + '&ecId=' + defaultEcId;
            }

            axios.get(fileDataApiUrl)
                .then((res) => {
                    // endDate = new Date();
                    // elapsedMilliseconds = endDate - startDate;
                    // console.log( dom.key + ' 获取api时间：'+ elapsedMilliseconds + 'ms');

                    // startDate = new Date();
                    if (!res) return;
                    fileToken = res.fileToken;
                    fileWebAPIUrl = res.fileWebAPIUrl;
                    let gridDom = getFileDataDeployGridDom(res.orgTmpTypeDtos, res.isDisable, titleId, previewFileCallback, downFileCallback);

                    switch (dom.key) {
                        case 'lx':
                            ref_grid_lx && ref_grid_lx.update({ children: gridDom });
                            break;
                        case 'ht':
                            ref_grid_ht && ref_grid_ht.update({ children: gridDom });
                            break;
                        case 'qd':
                            ref_grid_qd && ref_grid_qd.update({ children: gridDom });
                            break;
                        case 'zk':
                            ref_grid_zk && ref_grid_zk.update({ children: gridDom });
                            break;
                        case 'jt':
                            ref_grid_jt && ref_grid_jt.update({ children: gridDom });
                            break;
                        case 'zzRyb':
                            ref_grid_zzRyb && ref_grid_zzRyb.update({ children: gridDom });
                            break;
                        case 'unZzRyb':
                            ref_grid_unZzRyb && ref_grid_unZzRyb.update({ children: gridDom });
                            break;
                        case 'ryb':
                            ref_grid_ryb && ref_grid_ryb.update({ children: gridDom });
                            break;
                        default:
                            dom && dom.update({ children: gridDom });
                            break;
                    }
                   
                });
            getFileData(obj_paras);
        };
        //下载文件
        function downFile(_url, _filename, _fileType) {
            window.open(_url);
        }


        //创建grid回调 获取api数据
        function gridBindDataCallback(_gridDom) {
            // if(_gridDom.props.functionName) 
            getFileData(_gridDom.props.functionName, _gridDom);
        }
        //预览回调
        function previewFileCallback(tokenJosn) {
            if (!user) {
                localStorage.setItem("url_beforlogin", "#!research/organizedetail/?SiteId=" + (query && query.SiteId) + `&v=${new Date().getTime()}`);
                location.href = '/Account/Login/#institutiondb_redirectlast';
                return;
            }
            tokenJosn && (tokenJosn.per = fileToken.per, tokenJosn.oid = orgId);
            let token = encryptFile(tokenJosn);
            let preview_url = ''
            preview_url = window.location.origin + '/Common/MediaFile/PreviewOld?token=' + token;
            let link = document.createElement('a');
            link.setAttribute('href', preview_url);
            link.setAttribute('target', '_blank');
            link.click();
        }
        //下载回调
        function downFileCallback(tokenJosn, downFileName, downFileType) {
            if (!user) {
                localStorage.setItem("url_beforlogin", "#!research/organizedetail/?SiteId=" + (query && query.SiteId) + `&v=${new Date().getTime()}`);
                location.href = '/Account/Login/#institutiondb_redirectlast';
                return;
            }
            tokenJosn && (tokenJosn.per = fileToken.per, tokenJosn.oid = orgId);
            let token = encryptFile(tokenJosn);
            let down_url = '';
            if (fileWebAPIUrl) {
                down_url = fileWebAPIUrl + 'MediaFile/Download?token=' + token;
            } else {
                down_url = window.location.origin + '/Common/MediaFile/Download?token=' + token;
            }
            // let down_url = (fileWebAPIUrl || window.location.origin + '/') +'MediaFile/Download?token='+token;
            downFile(down_url, downFileName, downFileType);
        }

        let ecFirstPanelKey = '';  //默认选中第一个panel的key

        //伦理（获取审查分类）
        function getEcTmpCategory() {
            axios.get('/api/institution-db/files/get-ectemp-category-list?orgId=' + orgId)
                .then(res => {
                    if (!res) return;
                    defaultEcId = res.ecId;
                    if (res.codeList) {
                        let ecHeadAry = [], ecBodyAry = [];
                        let codeList = res.codeList;
                        for (let i = 0; i < codeList.length; i++) {
                            if (i == 0) ecFirstPanelKey = 'll' + codeList[i].codeValue;
                            let ref_grid_ec;
                            let ecFunctionName = 'EC_' + codeList[i].codeValue;
                            let ecHeadItem = { key: 'll' + codeList[i].codeValue, text: codeList[i].codeText, attrs: { id: 'file_tablist_title_ll' + codeList[i].codeValue } };
                            let ecBodyItem = {
                                key: 'll' + codeList[i].codeValue,
                                ref: (c) => { ref_grid_ec = c; },
                                autoRender: false,
                                onCreated: function () {
                                    if (ref_grid_ec.firstRender) {
                                        fileDataLoad_paras_ll.push({ functionName: ecFunctionName, dom: ref_grid_ec, isEc: true, titleId: 'file_tablist_title_ll' + codeList[i].codeValue });
                                    }
                                }
                            };
                            ecHeadAry.push(ecHeadItem);
                            ecBodyAry.push(ecBodyItem);
                        }

                        if (ecHeadAry) ref_tablist_fileData_ll.update({ items: ecHeadAry });
                        if (ecBodyAry) tabListLlContent.update({ panels: ecBodyAry });

                        getFileData(fileDataLoad_paras_ll);

                        if (ecFirstPanelKey) ref_tablist_fileData_ll.update({ selectedItems: ecFirstPanelKey });
                    }
                });
        }


        const CommentItem = function (item) {
            let strdate = item.createdTime.replace('T', ' ');
            let formattime = formatTime(strdate);
            return {
                component: 'Cols',
                ref: c => {
                    comitemRef = c
                },
                attrs: {
                    id: item.id,
                    userid: item.userid,
                    style: {
                        'margin': '10px 0',
                    },
                    onmouseover: (args) => {
                        let userid = args.currentTarget.component.element.getAttribute('userid');
                        if (user != null && user.Id == userid) {
                            args.currentTarget.component.children[1].children[0].children[0].children[0].children[2].children[0].children[0].children[0].show();

                        }
                    },
                    onmouseleave: (args) => {
                        args.currentTarget.component.children[1].children[0].children[0].children[0].children[2].children[0].children[0].children[0].hide();

                    }
                },
                strechIndex: 1,
                align: 'start',
                items: [
                    {
                        tag: "img",
                        attrs: {
                            src: item.userAvatarImg,
                            style: {
                                width: "50px",
                                height: "50px",
                            }
                        },
                        styles: {
                            shape: "circle",
                        },
                    },
                    {
                        component: 'Rows',
                        items: [{
                            component: 'Cols',
                            strechIndex: 1,
                            items: [{
                                children: item.userName
                            },
                            {
                                children: formattime
                            },
                            {
                                component: 'Cols',
                                attrs: {
                                    style: {
                                        width: '160px',

                                    }
                                },
                                justify: 'end',
                                items: [
                                    {
                                        component: 'Button',
                                        icon: 'delete',
                                        text: '删除',
                                        type: 'text',
                                        hidden: true,
                                        onClick: (args) => {
                                            delclick(args);
                                        }
                                    },
                                    {
                                        component: 'Button',
                                        text: '回复',
                                        type: 'text',
                                        icon: 'message-info',
                                        classes: {
                                            replybtn: true
                                        },
                                        onClick: (args) => {
                                            replyclick(args);
                                        }
                                    }
                                ]
                            }]
                        },
                        {
                            ref: c => {
                                strreplyRef = c
                            },
                            children: item.comment
                        },
                        {
                            component: 'Rows',
                            hidden: true,
                            classes: {
                                MultilineTextboxRow: true
                            },
                            items: [
                                {
                                    component: 'MultilineTextbox',
                                    placeholder: '评论内容(上限2000)',
                                    maxLength: 2000,
                                    autoSize: {
                                        minRows: 4,
                                        maxRows: 8
                                    }
                                },
                                {
                                    component: 'Cols',
                                    attrs: {
                                        style: {
                                            'justify-content': 'flex-end',
                                        }
                                    },
                                    items: [{
                                        component: 'Button',
                                        text: '发表',
                                        type: 'primary',
                                        onClick: (args) => {
                                            PublishComment(args);
                                        },
                                    }]
                                }],
                        }]
                    },

                ]

            }
        }

        //获取评论列表：
        const asyncCommentlist = function () {
            const searchParams = { ...query }
            commentref.update({ items: [] });
            sumcomment = 0;
            axios.get(`/api/institutiondb/center/by-org/get-comment-list`, { params: searchParams })
                .then(response => {
                    if (response.length > 0) {

                        let comitem = '';

                        for (let i = 0; i < response.length; i++) {
                            if (response[i].parentId != null) {
                                continue;
                            }
                            comitem = CommentItem(response[i]);
                            commentref.appendDataItem(comitem);
                            sumcomment++;

                            let count = SecondItem(response, response[i].id, childcount = 0);
                            if (count > 2) {
                                commentref.appendDataItem({
                                    component: 'Button',
                                    icon: 'down',
                                    type: 'text',
                                    text: `全部${count}条回复`,
                                    attrs: { style: { 'margin-left': '100px', 'margin-bottom': '10px' } },
                                    onClick: (args) => {
                                        let allitem = args.sender.parent.parent.element.previousSibling.component.children[0].children[0];
                                        if (allitem.props.hidden == true) {
                                            args.sender.update({
                                                text: `收起`,
                                                icon: 'up',
                                            });
                                            allitem.show();
                                        }
                                        else {
                                            args.sender.update({
                                                text: `全部${count}条回复`,
                                                icon: 'down',
                                            });
                                            allitem.hide();
                                        }
                                    }

                                });
                            }


                        }

                    }
                    comcountRef.update({ children: `评论（${sumcomment}）` });
                })
        }


        function SecondItem(items, pid) {
            let newItems = items.filter(item => item.parentId == pid);
            if (!newItems) return;
            for (var i = 0; i < newItems.length; i++) {
                childcount++;

                comitem = CommentItem(newItems[i]);
                if (childcount == 3) {
                    commentref.appendDataItem({
                        component: 'List',
                        hidden: true,
                        cols: '1',
                        ref: (c) => {
                            comlisthideRef = c
                        },
                    });

                    comlisthideRef.appendDataItem(comitem);
                }
                else if (childcount > 3) {

                    comlisthideRef.appendDataItem(comitem);
                }
                else {

                    commentref.appendDataItem(comitem);
                }
                sumcomment++;
                comitemRef.update({ attrs: { style: { 'margin-left': '55px' } } });
                if (newItems[i].replyName != null) {
                    strreplyRef.update({ children: '回复' + newItems[i].replyName + ':' + newItems[i].comment })
                }
                SecondItem(items, newItems[i].id);

            }
            return childcount;
        }

        //回复评论
        function replyclick(args) {
            let thisbtntext = args.sender.element.innerText;
            let buttons = $('.replybtn');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].component.update({
                    text: '回复',
                });
            }

            let MultilineTextboxRow = $('.MultilineTextboxRow');
            for (var j = 0; j < MultilineTextboxRow.length; j++) {
                MultilineTextboxRow[j].component.hide();
                MultilineTextboxRow[j].children[0].children[0].component.clear();
            }


            if (thisbtntext == '回复') {
                args.sender.update({
                    text: '取消回复',
                });
                args.sender.parent.parent.parent.parent.parent.parent.children[2].children[0].show()

            }
            else {

                args.sender.update({
                    text: '回复',
                });
                args.sender.parent.parent.parent.parent.parent.parent.children[2].children[0].hide();

            }
        }

        //删除评论
        function delclick(args) {

            new nomui.Confirm({
                title: '确认删除这条评论吗?',
                onOk: () => {
                    let id = args.sender.parent.parent.parent.parent.parent.parent.parent.parent.element.id;
                    axios.post(`/api/institutiondb/center/by-org/del-comment`, { id }).then((ret) => {
                        asyncCommentlist();
                    })
                },
            })

        }

        function FirstPublishComment() {
            if (user == null) {
                localStorage.setItem("lasturl", window.location.href);
                window.location.href = '/Account/Login/#institutiondb';
            }

            let Comment = firsttextareaRef.currentValue;
            let TenantId = orgId;
            let Type = 1;
            if (Comment == null || Comment.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') == '') {
                return;
            }
            axios.post(`/api/institutiondb/center/by-org/publish-comment`, { Comment, TenantId, Type }).then((ret) => {
                firsttextareaRef.clear();
                asyncCommentlist();
            })
        }
        //发表评论
        function PublishComment(args) {
            if (user == null) {
                localStorage.setItem("lasturl", window.location.href);
                window.location.href = '/Account/Login/#institutiondb';
            }
            let id = args.sender.parent.parent.parent.parent.parent.parent.parent.parent.element.id;
            let Comment = args.sender.parent.parent.parent.parent.children[0].children[0].currentValue;
            if (Comment == null || Comment.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') == '') {
                return;
            }
            let TenantId = orgId;
            let Type = 1;
            axios.post(`/api/institutiondb/center/by-org/publish-comment`, { id, Comment, TenantId, Type }).then((ret) => {

                asyncCommentlist();
            })
        }

        //入组速率：
        function asyncEnrollRate() {
            const Params = { SiteId: orgId };
            const searchParams = { ...Params }
            axios.get(`/api/institutiondb/center/by-org/enroll-rate`, { params: searchParams })
                .then(response => {
                    if (response == -2) {
                        ruzurowRef.parent.hide();
                        return;
                    }
                    else if (response == -1) {
                        rate = '-'
                    }
                    else {
                        rate = response + '例/月';
                    }

                    ruzuRef.update({
                        items: [
                            {
                                tag: "span",
                                children: '入组速率',
                            },
                            {
                                tag: "span",
                                children: rate,
                            },
                        ]
                    });
                })
        }

        return {
            title: '',
            view: {

                component: 'Rows',
                styles: {
                    color: 'white',
                },
                items: [
                    {
                        component: 'Breadcrumb',
                        ref: c => {
                            breadRef = c
                        }
                    },
                    {
                        component: 'Cols',
                        strechIndex: 0,
                        justify: 'start',
                        align: 'start',
                        items: [
                            {
                                component: 'Rows',
                                attrs: {
                                    style: { padding: '0px 20px 0px 20px' }
                                },
                                ref: c => {
                                    personRef = c
                                },
                                onCreated() {
                                    asyncHeadDetail();
                                },
                            },
                            {
                                component: 'Cols',
                                attrs: {
                                    style: { padding: '20px' }
                                },
                                items: [
                                    {
                                        component: 'Button',
                                        hidden: true,
                                        text: '项目申请',
                                        ref: c => {
                                            applybtnRef = c
                                        },
                                    },
                                    {
                                        component: 'Button',
                                        text: '我要认领',
                                        ref: (c) => { btnClaim = c; },
                                        icon: 'redflag',
                                        isClaim: false,
                                        isClick: false,
                                        claimId: '',
                                        claimStatus: 0,
                                        onClick: function () {
                                            if (btnClaim.props.isClick) return;
                                            if (!user) {
                                                localStorage.setItem("url_beforlogin", "#!research/organizedetail/?SiteId=" + query.SiteId + `&v=${new Date().getTime()}`);
                                                location.href = '/Account/Login/#institutiondb_redirectlast';
                                                return;
                                            }
                                            if (!btnClaim.props.claimId && (!query.SiteId || !user.Id)) {
                                                console.log("缺少参数！")
                                                return;
                                            }
                                            
                                            btnClaim.update({ isClick: true });
                                            let enty = {};
                                            if (btnClaim.props.isClaim) {
                                                //取消
                                                //btnClaim.update({text:'我要认领',icon:'redflag',isClaim:false});
                                                enty = { id: btnClaim.props.claimId, orgId: query.SiteId, userId: user.Id };
                                                axios.post('/api/institution-db/org-claims/cancel-org-claim', enty)
                                                    .then((res) => {
                                                        getUserOrgClaim();
                                                        btnClaim.update({ isClick: false });
                                                    });

                                            } else {
                                                //认领
                                                //btnClaim.update({text:'取消认领',icon:'redflag-red',isClaim:true});
                                                if (btnClaim.props.claimId) {
                                                    if (btnClaim.props.claimStatus == 2) {
                                                        btnClaim.update({ isClick: false });
                                                        new nomui.Alert({
                                                            type: 'success',
                                                            description: '该机构认领申请已提交，请等待平台审核。'
                                                        });
                                                        return;
                                                    }
                                                }
                                                enty = { orgId: query.SiteId, userId: user.Id };
                                                axios.post('/api/institution-db/org-claims/add-org-claim', enty)
                                                    .then((res) => {
                                                        if (res && !res.isOk) {
                                                            btnClaim.update({ isClick: false });
                                                            if (res.type == 1) {
                                                                new nomui.Alert({
                                                                    title: '认领提示',
                                                                    description: res.msg,
                                                                    _config: function () {
                                                                        const alertInst = this

                                                                        this.setProps({
                                                                            action: [
                                                                                {
                                                                                    component: 'Button',
                                                                                    text: '完善资料',
                                                                                    onClick: () => {
                                                                                        window.open("/My/Account/SetPersonalData");
                                                                                    }
                                                                                }, {
                                                                                    component: 'Button',
                                                                                    text: '取消',
                                                                                    onClick: () => {
                                                                                        alertInst.close()
                                                                                    }
                                                                                }
                                                                            ]
                                                                        })
                                                                    }
                                                                })
                                                            } else {
                                                                new nomui.Alert({
                                                                    type: 'error',
                                                                    title: '错误',
                                                                    description: res.msg,
                                                                });
                                                            }

                                                        } else {
                                                            btnClaim.update({ isClick: false });
                                                            getUserOrgClaim();
                                                            new nomui.Alert({
                                                                type: 'success',
                                                                description: res.msg || '认领申请提交成功，请等待审核。'
                                                            });
                                                        }

                                                    });
                                            }
                                        },
                                        attrs: { style: isHide }
                                    },
                                    {
                                        component: 'Button',
                                        text: '分享',
                                        icon: 'share',
                                        //hidden: true,
                                        onClick: function () {
                                            new nomui.Modal({
                                                size: 'small',
                                                data: {
                                                    url: location.href,
                                                    siteId: query.SiteId,
                                                    orgname: orgname,
                                                    userId: user == null ? "" : user.Id
                                                },
                                                content: '/webapp/institutiondb/personalCenter/orgQRshare.js',
                                            });
                                        },
                                        attrs: { style: isHide }
                                    },
                                    {
                                        component: 'Button',
                                        text: '关注',
                                        icon: 'love-nomal',
                                        isAtten: false,
                                        attenId: '',
                                        ref: (c) => { btnAtten = c; },
                                        onClick: function () {
                                            if (!user) {
                                                localStorage.setItem("url_beforlogin", "#!research/organizedetail/?SiteId=" + query.SiteId + `&v=${new Date().getTime()}`);
                                                location.href = '/Account/Login/#institutiondb_redirectlast';
                                                return;
                                            };
                                            if (!query || !query.SiteId || !user.Id) {
                                                console.log("缺少参数！")
                                                return;
                                            }
                                            let enty = { userId: user.Id, siteId: query.SiteId };
                                            addAttention(enty, attenClick);
                                            function attenClick(res) {
                                                if (res) {
                                                    getUserOrgAtten();
                                                    if (btnAtten.props.isAtten) {
                                                        new nomui.Message({
                                                            content: '取关成功',
                                                            type: 'success'
                                                        });
                                                    } else {
                                                        new nomui.Message({
                                                            content: '关注成功',
                                                            type: 'success'
                                                        });
                                                    }
                                                }
                                            }
                                        },
                                        onCreated: function () {
                                            getUserOrgClaim();
                                            getUserOrgAtten();
                                        },
                                        attrs: { style: isHide }
                                    },
                                    {
                                        component: 'Button',
                                        text: '我要纠错',
                                        ref: (c) => { btnEdit = c; },
                                        isEditOn: false,
                                        isEditDom: '',
                                        hidden: true,
                                        attrs: {
                                            style: 'width: 80px;height: 80px;border-radius: 50%;position: fixed;top: 500px;' + isHide
                                        },
                                        onClick: function () {
                                            if (!user) {
                                                localStorage.setItem("url_beforlogin", "#!research/organizedetail/?SiteId=" + (query && query.SiteId) + `&v=${new Date().getTime()}`);
                                                location.href = '/Account/Login/#institutiondb_redirectlast';
                                                return;
                                            }
                                            //if (!selectedtab) selectedtab = 'tab0';
                                            selectedtab = tabRef.getSelectedTab().key;
                                            if (!selectedtab) {
                                                console.log('无法选中的tab页签~');
                                                return;
                                            }
                                            let handleDom = getHandleDom(selectedtab);

                                            if (!handleDom || (handleDom && handleDom.length == 0)) {
                                                console.log('无法获取操作元素~');
                                                return;
                                            }
                                            if (btnEdit.props.isEditOn) {
                                                if (selectedtab != btnEdit.props.isEditDom) return;
                                                completeEdit(handleDom);
                                                return;
                                            }

                                            //for (let item of handleDom) {
                                            let list = orgbasicRef.props.items[1].items;
                                            for (let i = 0; i < list.length - 1; i++) {
                                                //let data_edit = list[i].children.data_edit || {};
                                                list[i].children.items.push({
                                                    component: 'Button', text: '纠错', icon: 'edit', type: 'primary', size: 'small',
                                                    attrs: {
                                                        onclick: function () {
                                                            btnEditClick(list[i].children);
                                                        }
                                                    }
                                                });
                                            }
                                            orgbasicRef.update({});
                                            //}

                                            btnEdit.update({ text: '完成纠错', isEditOn: true, isEditDom: selectedtab });
                                        },
                                        attrs: { style: isHide }
                                    }
                                ]
                            },


                        ]
                    },
                    {
                        attrs: {
                            style: { 'padding-left': '20px' }
                        },
                        children: {
                            component: 'Cols',
                            items: [
                                {
                                    tag: "span",
                                    ref: c => {
                                        updatetimeRef = c
                                    },
                                    children: '',
                                },
                                {
                                    tag: "span",
                                    ref: c => {
                                        updateuserRef = c
                                    },
                                    children: '',
                                }
                            ]
                        },
                        onCreated() {
                            asyncOrgUpdatedTime();
                            asyncOrgUpdatedUser();
                        },
                    },
                    //-----优势适应症------
                    {
                        component: 'Container',
                        attrs: {
                            style: {
                                'padding-left': '20px',
                            }
                        },
                        children: [{
                            component: 'Divider',
                            dashed: true,
                        },
                        {
                            component: 'Cols',
                            align: 'center',
                            ref: c => {
                                topindicationRef = c
                            },
                            onCreated() {
                                asyncTopIndication();
                            },
                        },
                        {
                            component: 'Divider',
                            dashed: true,
                        },]
                    },
                    {
                        component: 'AnchorContent',
                        key: 'key1',
                    },
                    {
                        component: 'AnchorContent',
                        key: 'key4',
                    },
                    {
                        component: 'AnchorContent',
                        key: 'key7',
                    },
                    {
                        component: 'Tabs',
                        uistyle: 'line',

                        ref: c => {
                            tabRef = c
                        },
                        onCreated() {
                            if (btnEdit) btnEdit.update({ hidden: false });
                            asyncOrgBasicList();
                        },
                        onTabSelectionChange: () => {
                            selectedtab = tabRef.getSelectedTab().key;
                            if (btnEdit.props.isEditOn) {
                                let handleDom = getHandleDom(btnEdit.props.isEditDom);
                                completeEdit(handleDom);
                            }
                            if (selectedtab == 'tab0') {
                                if (btnEdit) btnEdit.update({ hidden: false });
                                asyncOrgBasicList();
                            }
                            else if (selectedtab == 'tab1') {
                                if (btnEdit) btnEdit.update({ hidden: false });
                                asyncethictabList();
                            }
                            else if (selectedtab == 'tab2') {
                                if (btnEdit) btnEdit.update({ hidden: true });
                                asyncmajortabList();
                            }
                            else if (selectedtab == 'tab3') {
                                if (btnEdit) btnEdit.update({ hidden: false });
                                asyncinheritancetabList();
                            }
                            else if (selectedtab == 'tab4') {
                                if (btnEdit) btnEdit.update({ hidden: true });
                                asyncSearchCenterProject({ PageIndex: 1, PageSize: 10 });
                                asyncTestStageChart();//试验分期
                                asyncClassifyChart();//试验分类
                                asyncDrugChart();//药物分类
                                asyncTestStatusChart();//试验状态
                                asyncYearChart();//试验年趋势分析
                                asyncMonthChart();//月

                            }
                            else if (selectedtab == 'tab5') {
                                if (btnEdit) btnEdit.update({ hidden: true });
                                asyncMainSearch({ PageIndex: 1, PageSize: 10 });
                            }
                            else if (selectedtab == 'tab6') {
                                if (btnEdit) btnEdit.update({ hidden: true });
                                asyncSearchCenterProject3({ PageIndex: 1, PageSize: 10 });
                            }
                            else {
                                if (btnEdit) btnEdit.update({ hidden: true });
                                asyncSearchCenterProject4({ PageIndex: 1, PageSize: 10 });
                            }
                        },

                        attrs: {
                            style: {
                                paddingLeft: '20px',
                                paddingBottom: '20px'
                            }
                        },
                        tabs: [
                            {
                                item: { text: '机构' },
                                panel: {
                                    children: {
                                        component: 'Cols',
                                        align: 'start',
                                        items: [{
                                            children: [
                                                {
                                                    component: 'Rows',
                                                    ref: c => {
                                                        orgbasicRef = c
                                                    },

                                                },
                                                {
                                                    component: 'AnchorContent',
                                                    key: 'key2',
                                                },
                                                {
                                                    component: 'Rows',
                                                    attrs: {
                                                        style: {
                                                            paddingLeft: '20px',
                                                            paddingTop: '10px',
                                                        }
                                                    },
                                                    items: [{
                                                        tag: 'text',
                                                        children: 'SSU各阶段时长'
                                                    },
                                                    {
                                                        component: 'Grid',
                                                        ref: c => {
                                                            ssuRef = c
                                                        },
                                                        columns: [
                                                            {
                                                                title: '',
                                                                field: 'ssutype'
                                                            },
                                                            {
                                                                title: '平均时长（天）',
                                                                field: 'avgdays'
                                                            },
                                                            {
                                                                title: '最长时长（天）',
                                                                field: 'maxdays'
                                                            },
                                                            {
                                                                title: '最短时长（天）',
                                                                field: 'mindays'
                                                            }]
                                                    }]
                                                },
                                                {
                                                    component: 'Rows',
                                                    items: [{
                                                        attrs: {
                                                            style: {
                                                                'margin-top': '15px'
                                                            }
                                                        },
                                                        children: {
                                                            component: 'Cols',
                                                            items: [{
                                                                attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                            }, {
                                                                children: '机构人员',
                                                            }]
                                                        }
                                                    }, {
                                                        component: 'Grid',
                                                        attrs: { style: 'margin-left:20px;' },
                                                        ref: c => {
                                                            orgpersonRef = c
                                                        },
                                                        columns: [
                                                            {
                                                                title: '姓名',
                                                                field: 'name'
                                                            },
                                                            {
                                                                title: '职级',
                                                                field: 'position'
                                                            },
                                                            {
                                                                title: '电话',
                                                                field: 'telephone'
                                                            },
                                                            {
                                                                title: '邮箱',
                                                                field: 'email'
                                                            }]
                                                    },
                                                    {
                                                        component: 'Pager',
                                                        attrs: { style: 'margin-left:20px;' },
                                                        ref: (c) => (pagerorgRef = c),
                                                        onPageChange: function (e) {
                                                            const pagerParams = pagerorgRef.getPageParams()
                                                            asyncOrgPerson({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize }, orgpersonRef, pagerorgRef)
                                                        }
                                                    }
                                                    ]
                                                },
                                                {
                                                    attrs: {
                                                        style: {
                                                            'margin-top': '15px'
                                                        }
                                                    },
                                                    children: {
                                                        component: 'Cols',
                                                        items: [{
                                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                        }, {
                                                            children: '文件资料',
                                                        }]
                                                    }
                                                },
                                                {
                                                    component: 'Rows',
                                                    items: [{
                                                        component: 'Panel',
                                                        uistyle: 'uistyle',
                                                        attrs: {
                                                            style: 'margin-left:20px;margin-top:4px;'
                                                        },
                                                        header: {

                                                            component: 'TabList',
                                                            uistyle: 'pill',
                                                            selectedItems: 'lx',
                                                            ref: (c) => { ref_tablist_fileData = c; },
                                                            tabContent: () => {
                                                                return tabListContent;
                                                            },
                                                            items: [
                                                                {
                                                                    key: 'lx',
                                                                    text: '立项资料',
                                                                    attrs: { id: 'file_tablist_title_lx' }
                                                                },
                                                                {

                                                                    key: 'ht',
                                                                    text: '合同资料',
                                                                    attrs: { id: 'file_tablist_title_ht' }

                                                                },
                                                                {
                                                                    key: 'qd',
                                                                    text: '启动会资料',
                                                                    attrs: { id: 'file_tablist_title_qd' }
                                                                },
                                                                {
                                                                    key: 'jt',
                                                                    text: '结题/关闭资料',
                                                                    attrs: { id: 'file_tablist_title_jt' }
                                                                }
                                                            ],

                                                        },
                                                        body: {
                                                            attrs: {
                                                                style: 'margin-top:10px;'
                                                            },
                                                            children: {
                                                                component: 'TabContent',
                                                                selectedPanel: 'lx',
                                                                ref: (c) => {
                                                                    tabListContent = c
                                                                },
                                                                panels: [
                                                                    {

                                                                        key: 'lx',
                                                                        ref: (c) => { ref_grid_lx = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'ApplyProjectDrug';
                                                                            if (ref_grid_lx.firstRender) {
                                                                                fileDataLoad_paras_jg.push({ functionName: defulatFunctionName, dom: ref_grid_lx, titleId: 'file_tablist_title_lx' });
                                                                            }
                                                                        }


                                                                    },
                                                                    {

                                                                        key: 'ht',
                                                                        ref: (c) => { ref_grid_ht = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'Contract_ApplyProjectDrug,ContractSideLetter_ApplyProjectDrug,SMOContract_ApplyProjectDrug';
                                                                            if (ref_grid_ht.firstRender) {
                                                                                fileDataLoad_paras_jg.push({ functionName: defulatFunctionName, dom: ref_grid_ht, titleId: 'file_tablist_title_ht' });
                                                                            }


                                                                        }

                                                                    },
                                                                    {

                                                                        key: 'qd',
                                                                        ref: (c) => { ref_grid_qd = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'ProjectStartOther_ApplyProjectDrug';
                                                                            if (ref_grid_qd.firstRender) {
                                                                                fileDataLoad_paras_jg.push({ functionName: defulatFunctionName, dom: ref_grid_qd, titleId: 'file_tablist_title_qd' });
                                                                            }
                                                                        }

                                                                    },
                                                                    {

                                                                        key: 'jt',
                                                                        ref: (c) => { ref_grid_jt = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'ProjectCompleted,ProjectTermination';
                                                                            if (ref_grid_jt.firstRender) {
                                                                                fileDataLoad_paras_jg.push({ functionName: defulatFunctionName, dom: ref_grid_jt, titleId: 'file_tablist_title_jt' });

                                                                                getFileData(fileDataLoad_paras_jg);
                                                                            }
                                                                        }

                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    }]
                                                },

                                                {
                                                    component: 'Rows',
                                                    ref: c => {
                                                        orgcwRef = c
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            component: 'Anchor',
                                            ref: (c) => (organchorRef = c),
                                            width: 100,
                                            attrs: {
                                                style: {
                                                    position: 'relative',
                                                    'z-index': 991,
                                                }
                                            },
                                            sticky: true,
                                            container: window,
                                            items: [{ text: '基本信息', key: 'key1' },
                                            {
                                                text: '机构人员', key: 'key2'
                                            },
                                            { text: '财务信息', key: 'key3' }],
                                        }]
                                    }
                                },
                            },
                            {
                                item: { text: '伦理' },

                                panel: {
                                    children: {
                                        component: 'Cols',
                                        align: 'start',
                                        items: [{
                                            children: [
                                                {
                                                    children: {
                                                        component: 'Rows',
                                                        ref: c => {
                                                            ethicRef = c
                                                        },

                                                    },

                                                },
                                                {
                                                    component: 'Rows',
                                                    attrs: {
                                                        style: {
                                                            'margin-top': '15px'
                                                        }
                                                    },
                                                    items: [{
                                                        children: {
                                                            component: 'Cols',
                                                            items: [
                                                                {
                                                                    attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                                },
                                                                {
                                                                    component: 'AnchorContent',
                                                                    key: 'key5',
                                                                    children: '伦理人员',
                                                                },

                                                            ]
                                                        }
                                                    },
                                                    {
                                                        component: 'Grid',
                                                        attrs: { style: 'margin-left:20px;' },
                                                        ref: c => {
                                                            ethicpersonRef = c
                                                        },
                                                        columns: [
                                                            {
                                                                title: '姓名',
                                                                field: 'name'
                                                            },
                                                            {
                                                                title: '职级',
                                                                field: 'position'
                                                            },
                                                            {
                                                                title: '电话',
                                                                field: 'telephone'
                                                            },
                                                            {
                                                                title: '邮箱',
                                                                field: 'email'
                                                            }]
                                                    },
                                                    {
                                                        component: 'Pager',
                                                        attrs: { style: 'margin-left:20px;' },
                                                        ref: (c) => (pagerethicRef = c),
                                                        onPageChange: function (e) {
                                                            const pagerParams = pagerethicRef.getPageParams()
                                                            asyncEthicPerson({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize }, ethicRef, pagerethicRef)
                                                        }
                                                    }]
                                                },
                                                {
                                                    attrs: {
                                                        style: {
                                                            'margin-top': '15px'
                                                        }
                                                    },
                                                    children: {
                                                        component: 'Cols',
                                                        items: [{
                                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                        }, {
                                                            children: '文件资料',
                                                        }]
                                                    }
                                                },
                                                {
                                                    component: 'Rows',
                                                    items: [{
                                                        component: 'Panel',
                                                        uistyle: 'uistyle',
                                                        attrs: {
                                                            style: 'margin-left:20px;margin-top:4px;'
                                                        },
                                                        header: {
                                                            component: 'TabList',
                                                            uistyle: 'pill',
                                                            // selectedItems: 'll1',
                                                            ref: (c) => { ref_tablist_fileData_ll = c; },
                                                            tabContent: () => {
                                                                return tabListLlContent;
                                                            },
                                                            items: [
                                                                                                            
                                                            ],

                                                        },
                                                        body: {
                                                            attrs: {
                                                                style: 'margin-top:10px;'
                                                            },
                                                            children: {
                                                                component: 'TabContent',
                                                                selectedPanel: 'll1',
                                                                ref: (c) => { tabListLlContent = c; },
                                                                panels: [
                                                                    
                                                                ],
                                                            },
                                                        },
                                                    }]
                                                },
                                                {
                                                    component: 'Rows',
                                                    ref: c => {
                                                        ethiccwRef = c
                                                    },
                                                },
                                            ]
                                        },
                                        {
                                            component: 'Anchor',
                                            width: 100,
                                            attrs: {
                                                style: {
                                                    position: 'relative',
                                                    'z-index': 991,
                                                }
                                            },
                                            sticky: true,
                                            container: window,
                                            items: [{ text: '基本信息', key: 'key4' },
                                            {
                                                text: '伦理人员', key: 'key5'
                                            },
                                            { text: '财务信息', key: 'key6' }],
                                        }]
                                    },

                                },
                            },
                            {
                                item: { text: '专业' },
                                panel: {
                                    children: [
                                        {
                                            component: 'Rows',
                                            ref: c => {
                                                majorRef = c
                                            },

                                        },
                                        {
                                            component: 'Rows',
                                            items: [{
                                                attrs: {
                                                    style: {
                                                        'margin-top': '15px'
                                                    }
                                                },
                                                children: {
                                                    component: 'Cols',
                                                    items: [
                                                        {
                                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                        },
                                                        {
                                                            children: '备案专业',
                                                        },
                                                    ]
                                                }
                                            },

                                            {
                                                component: 'List',
                                                ref: (c) => {
                                                    majorbaRef = c
                                                },
                                                gutter: 'md',
                                                line: 'cross',
                                                cols: 1,
                                                items: [],
                                                itemDefaults: {
                                                    key: (inst) => {
                                                        return inst.props.text
                                                    },
                                                    _config: (inst) => {
                                                        inst.setProps({
                                                            children: inst.props.text,
                                                        })
                                                    },
                                                },

                                            }
                                            ]
                                        },
                                    ],
                                },
                            },
                            {
                                item: { text: '遗传办' },
                                panel: {
                                    children: {
                                        component: 'Cols',
                                        align: 'start',
                                        items: [{
                                            children: [
                                                {
                                                    component: 'Rows',
                                                    ref: c => {
                                                        inheritanceRef = c
                                                    },

                                                },
                                                {
                                                    component: 'AnchorContent',
                                                    key: 'key8',
                                                },
                                                {
                                                    attrs: {
                                                        style: {
                                                            'margin-top': '15px'
                                                        }
                                                    },
                                                    children: {
                                                        component: 'Cols',
                                                        items: [{
                                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                                        }, {
                                                            children: '文件资料',
                                                        }]
                                                    }
                                                },
                                                {
                                                    component: 'Rows',
                                                    items: [{
                                                        component: 'Panel',
                                                        uistyle: 'uistyle',
                                                        attrs: {
                                                            style: 'margin-left:20px;margin-top:4px;'
                                                        },
                                                        header: {
                                                            component: 'TabList',
                                                            uistyle: 'pill',
                                                            selectedItems: 'zzRyb',
                                                            ref: (c) => { ref_tablist_fileData_ycb = c; },
                                                            tabContent: () => {
                                                                return tabListYcbContent;
                                                            },
                                                            items: [
                                                                {
                                                                    key: 'zzRyb',
                                                                    text: '组长单位人遗办资料文件设置',
                                                                    attrs: { id: 'file_tablist_title_zzRyb' }
                                                                },
                                                                {

                                                                    key: 'unZzRyb',
                                                                    text: '非组长单位人遗办资料文件设置',
                                                                    attrs: { id: 'file_tablist_title_unZzRyb' }

                                                                },
                                                                {
                                                                    key: 'ryb',
                                                                    text: '人遗办信息非必须的附件设置',
                                                                    attrs: { id: 'file_tablist_title_ryb' }
                                                                },
                                                            ],

                                                        },
                                                        body: {
                                                            attrs: {
                                                                style: 'margin-top:10px;'
                                                            },
                                                            children: {
                                                                component: 'TabContent',
                                                                selectedPanel: 'zzRyb',
                                                                ref: (c) => { tabListYcbContent = c; },
                                                                panels: [
                                                                    {

                                                                        key: 'zzRyb',
                                                                        ref: (c) => { ref_grid_zzRyb = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'Genetic_1';
                                                                            if (ref_grid_zzRyb.firstRender) {
                                                                                fileDataLoad_paras_ycb.push({ functionName: defulatFunctionName, dom: ref_grid_zzRyb, titleId: 'file_tablist_title_zzRyb' });
                                                                            }
                                                                        }
                                                                    },
                                                                    {

                                                                        key: 'unZzRyb',
                                                                        ref: (c) => { ref_grid_unZzRyb = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'Genetic_0';
                                                                            if (ref_grid_unZzRyb.firstRender) {
                                                                                fileDataLoad_paras_ycb.push({ functionName: defulatFunctionName, dom: ref_grid_unZzRyb, titleId: 'file_tablist_title_unZzRyb' });
                                                                            }
                                                                        }
                                                                    },
                                                                    {

                                                                        key: 'ryb',
                                                                        ref: (c) => { ref_grid_ryb = c; },
                                                                        autoRender: false,
                                                                        onCreated: function () {
                                                                            defulatFunctionName = 'ProjectStart_NoGenRes';
                                                                            if (ref_grid_ryb.firstRender) {
                                                                                fileDataLoad_paras_ycb.push({ functionName: defulatFunctionName, dom: ref_grid_ryb, titleId: 'file_tablist_title_ryb' });
                                                                            }
                                                                        }

                                                                    },

                                                                ],
                                                            },
                                                        },
                                                    }]
                                                },
                                            ],
                                        }, {
                                            component: 'Anchor',
                                            width: 100,
                                            attrs: {
                                                style: {
                                                    position: 'relative',
                                                    'z-index': 991,
                                                }
                                            },
                                            sticky: true,
                                            container: window,
                                            items: [{ text: '基本信息', key: 'key7' },
                                            {
                                                text: '文件资料', key: 'key8'
                                            }],
                                        }
                                        ]
                                    }

                                },
                            },

                            {
                                item: { text: '试验' },
                                panel: {
                                    children: [{
                                        component: 'Tabs',
                                        uistyle: 'plain',
                                        tabs: [
                                            {
                                                item: { text: '试验信息' },
                                                panel: {
                                                    children: {
                                                        component: 'Rows',
                                                        items: [
                                                            {
                                                                children: {
                                                                    component: 'Cols',
                                                                    justify: 'end',
                                                                    attrs: {
                                                                        style: {
                                                                            paddingRight: '5px',
                                                                        }
                                                                    },
                                                                    items: [
                                                                        {
                                                                            children: {
                                                                                component: 'Button',
                                                                                text: '导出',
                                                                                tooltip: '导出Excel',
                                                                                onClick: () => {

                                                                                    handleExport({ ... { PageIndex: 1, PageSize: 999999 } });
                                                                                },
                                                                            }
                                                                        }],
                                                                },

                                                            },

                                                            {
                                                                children: [{
                                                                    component: 'Grid',
                                                                    ellipsis: 'both',
                                                                    ref: c => {
                                                                        gridtestRef = c
                                                                    },
                                                                    onCreated() {
                                                                        asyncSearchCenterProject({ PageIndex: 1, PageSize: 10 })
                                                                    },
                                                                    columnResizable: true,
                                                                    columnsCustomizable: true,
                                                                    columns: [
                                                                        {
                                                                            title: '登记号',
                                                                            field: 'registrationNo',
                                                                            cellRender: (args) => {
                                                                                return {
                                                                                    tag: 'a',
                                                                                    attrs: {
                                                                                        title: args.rowData.registrationNo,
                                                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SiteId=' + orgId,
                                                                                    },
                                                                                    children: args.rowData.registrationNo
                                                                                }
                                                                            }
                                                                        },
                                                                        {

                                                                            title: '试验名称',
                                                                            //ellipsis: true,
                                                                            field: 'popularTitle',
                                                                            cellRender: (args) => {
                                                                                return {
                                                                                    tag: 'a',
                                                                                    attrs: {
                                                                                        title: args.rowData.popularTitle,
                                                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SiteId=' + orgId,
                                                                                    },
                                                                                    children: args.rowData.popularTitle
                                                                                }
                                                                            }
                                                                        },
                                                                        {
                                                                            field: 'drugName',
                                                                            title: '研究药物'
                                                                        },
                                                                        {
                                                                            field: 'indication',
                                                                            title: '适应症'
                                                                        },
                                                                        {
                                                                            field: 'sponsorName',
                                                                            title: '申办方',
                                                                            //ellipsis: true,
                                                                        },
                                                                        {
                                                                            field: 'studyPhase',
                                                                            title: '试验分期'
                                                                        },
                                                                        {
                                                                            field: 'publishedDate',
                                                                            title: '首次公示日期'
                                                                        },
                                                                        {
                                                                            field: 'studyStatus',
                                                                            title: '试验状态'
                                                                        },
                                                                    ]

                                                                },
                                                                {
                                                                    component: 'Pager',
                                                                    ref: (c) => (pagerRef = c),
                                                                    onPageChange: function (e) {
                                                                        const pagerParams = pagerRef.getPageParams()
                                                                        asyncSearchCenterProject({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                                                    }
                                                                }],
                                                            }
                                                        ],
                                                    },


                                                },
                                            },
                                            {
                                                item: { text: '图表分析' },
                                                panel: {
                                                    children: [{
                                                        ref: c => {
                                                            chartref = c
                                                        },
                                                        children: {
                                                            component: 'Rows',
                                                            items: [{
                                                                children: {
                                                                    component: 'Cols',
                                                                    gutter: "md",
                                                                    justify: "around",
                                                                    items: [

                                                                        {
                                                                            component: "Rows",
                                                                            items: [{
                                                                                children: {
                                                                                    component: "Caption",
                                                                                    title: '试验分期',
                                                                                    classes: {
                                                                                        'u-justify-center': true
                                                                                    }
                                                                                },
                                                                            },
                                                                            {
                                                                                children: {
                                                                                    component: WetrialChart,

                                                                                    type: "Pie",
                                                                                    ref: c => {
                                                                                        teststageRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        appendPadding: 10,
                                                                                        data,
                                                                                        angleField: 'chartCount',
                                                                                        colorField: 'studyPhase',
                                                                                        radius: 1,
                                                                                        innerRadius: 0.6,
                                                                                        width: 400,
                                                                                        legend: {
                                                                                            itemWidth: 60,
                                                                                        },
                                                                                        label: {
                                                                                            type: 'inner',
                                                                                            offset: '-50%',
                                                                                            content: '{value}',
                                                                                            style: {
                                                                                                textAlign: 'center',
                                                                                                fontSize: 14,
                                                                                            },
                                                                                        },
                                                                                        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
                                                                                        statistic: {
                                                                                            title: false,
                                                                                            content: {
                                                                                                style: {
                                                                                                    whiteSpace: 'pre-wrap',
                                                                                                    overflow: 'hidden',
                                                                                                    textOverflow: 'ellipsis',
                                                                                                },
                                                                                                formatter: () => '',
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                }
                                                                            }],


                                                                        },

                                                                        {
                                                                            component: "Rows",
                                                                            items: [{
                                                                                children: {
                                                                                    component: "Caption",
                                                                                    title: '试验分类',
                                                                                    classes: {
                                                                                        'u-justify-center': true
                                                                                    }
                                                                                },
                                                                            },
                                                                            {
                                                                                children: {
                                                                                    component: WetrialChart,

                                                                                    type: "Pie",
                                                                                    ref: c => {
                                                                                        classifyRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        appendPadding: 10,
                                                                                        data,
                                                                                        angleField: 'chartCount',
                                                                                        colorField: 'studyType',
                                                                                        radius: 1,
                                                                                        innerRadius: 0.6,
                                                                                        width: 400,
                                                                                        legend: {
                                                                                            itemWidth: 60,
                                                                                        },
                                                                                        label: {
                                                                                            type: 'inner',
                                                                                            offset: '-50%',
                                                                                            content: '{value}',
                                                                                            style: {
                                                                                                textAlign: 'center',
                                                                                                fontSize: 14,
                                                                                            },
                                                                                        },
                                                                                        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
                                                                                        statistic: {
                                                                                            title: false,
                                                                                            content: {
                                                                                                style: {
                                                                                                    whiteSpace: 'pre-wrap',
                                                                                                    overflow: 'hidden',
                                                                                                    textOverflow: 'ellipsis',
                                                                                                },
                                                                                                formatter: () => '',
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                }
                                                                            }]
                                                                        }
                                                                    ]
                                                                }
                                                            },
                                                            {
                                                                component: "Rows",
                                                                items: [{
                                                                    children: {
                                                                        component: "Caption",
                                                                        title: '试验时间趋势分析图',
                                                                        classes: {
                                                                            'u-justify-center': true
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    component: 'Tabs',
                                                                    uistyle: 'pill',
                                                                    classes: {
                                                                        'u-justify-center-tab': true
                                                                    },
                                                                    tabs: [{
                                                                        item: { text: '按年' },
                                                                        panel: {
                                                                            children: {
                                                                                component: 'Cols',
                                                                                gutter: "md",
                                                                                justify: "around",
                                                                                items: [{
                                                                                    component: WetrialChart,
                                                                                    type: "Column",
                                                                                    ref: c => {
                                                                                        columyearRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data: data,
                                                                                        width: 400,
                                                                                        isStack: true,
                                                                                        xField: 'type',
                                                                                        yField: 'chartCount',
                                                                                        seriesField: 'studyPhase',
                                                                                        label: {
                                                                                            position: 'middle',
                                                                                        }
                                                                                    }
                                                                                },
                                                                                {

                                                                                    component: WetrialChart,
                                                                                    type: "Line",
                                                                                    ref: c => {
                                                                                        lineyearRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data: data,
                                                                                        width: 400,
                                                                                        isStack: true,
                                                                                        xField: 'type',
                                                                                        yField: 'chartCount',
                                                                                        seriesField: 'studyPhase',
                                                                                        label: {
                                                                                            position: 'bottom',
                                                                                        }
                                                                                    },

                                                                                }]
                                                                            }
                                                                        },

                                                                    },
                                                                    {
                                                                        item: { text: '按月' },
                                                                        panel: {
                                                                            children: {
                                                                                component: 'Cols',
                                                                                gutter: "md",
                                                                                justify: "around",
                                                                                items: [{
                                                                                    component: WetrialChart,
                                                                                    type: "Column",
                                                                                    ref: c => {
                                                                                        colummonthRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data: data,
                                                                                        width: 400,
                                                                                        isStack: true,
                                                                                        xField: 'name',
                                                                                        yField: 'chartCount',
                                                                                        seriesField: 'studyPhase',
                                                                                        label: {
                                                                                            position: 'middle',
                                                                                        }
                                                                                    }
                                                                                }, {

                                                                                    component: WetrialChart,
                                                                                    type: "Line",
                                                                                    ref: c => {
                                                                                        linemonthRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data: data,
                                                                                        width: 400,
                                                                                        isStack: true,
                                                                                        xField: 'name',
                                                                                        yField: 'chartCount',
                                                                                        seriesField: 'studyPhase',
                                                                                        label: {
                                                                                            position: 'middle',
                                                                                        }
                                                                                    },

                                                                                }]
                                                                            }
                                                                        },
                                                                    }]
                                                                }]
                                                            },
                                                            {
                                                                attrs: {
                                                                    style: {
                                                                        'margin-top': '50px'
                                                                    }
                                                                },
                                                                children: {
                                                                    component: 'Cols',
                                                                    gutter: "md",
                                                                    justify: "around",
                                                                    items: [
                                                                        {
                                                                            component: "Rows",
                                                                            items: [{
                                                                                children: {
                                                                                    component: "Caption",
                                                                                    title: '药物分类',
                                                                                    classes: {
                                                                                        'u-justify-center': true
                                                                                    }
                                                                                },
                                                                            },
                                                                            {
                                                                                children: {
                                                                                    component: WetrialChart,

                                                                                    type: "Bar",
                                                                                    ref: c => {
                                                                                        drugRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data,
                                                                                        xField: "chartCount",
                                                                                        yField: "drugClassification",
                                                                                        seriesField: "drugClassification",
                                                                                        legend: false,
                                                                                        maxBarWidth: 20,
                                                                                        width: 400,
                                                                                        label: {
                                                                                            position: 'middle', // 'top', 'bottom', 'middle'
                                                                                        },
                                                                                    },
                                                                                },
                                                                            }]
                                                                        },
                                                                        {
                                                                            component: "Rows",
                                                                            items: [{
                                                                                children: {
                                                                                    component: "Caption",
                                                                                    title: '试验状态',
                                                                                    classes: {
                                                                                        'u-justify-center': true
                                                                                    }
                                                                                },
                                                                            },
                                                                            {
                                                                                children: {
                                                                                    component: WetrialChart,
                                                                                    type: "Bar",
                                                                                    ref: c => {
                                                                                        teststatusRef = c
                                                                                    },
                                                                                    chartProps: {
                                                                                        data,
                                                                                        xField: "chartCount",
                                                                                        yField: "studyStatus",
                                                                                        seriesField: "studyStatus",
                                                                                        legend: false,
                                                                                        maxBarWidth: 20,
                                                                                        width: 400,
                                                                                        label: {
                                                                                            position: 'middle', // 'top', 'bottom', 'middle'
                                                                                        },
                                                                                    },
                                                                                }

                                                                            }],
                                                                        }
                                                                    ]
                                                                }
                                                            }],

                                                        },
                                                    }, {
                                                        component: 'Empty',
                                                        ref: c => {
                                                            emptyRef = c
                                                        },
                                                    }]

                                                },

                                            }
                                        ],
                                    }],

                                },
                            },

                            {
                                item: { text: '研究者' },
                                panel: {
                                    children: [{
                                        component: 'Grid',
                                        ref: c => {
                                            mainsearchRef = c
                                        },
                                        columns: [
                                            {
                                                title: '姓名',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        attrs: {
                                                            href: `#!research/resdetail/?SiteId=${args.rowData.studySiteId}&PIId=${args.rowData.piId}`
                                                        },
                                                        children: args.rowData.name
                                                    }
                                                }
                                            },
                                            {
                                                title: '职级',
                                                field: 'position'
                                            },
                                            {
                                                title: '科室',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        attrs: {
                                                            href: `#!research/departdetail?SiteId=${args.rowData.studySiteId}&deptId=${args.rowData.deptId}`
                                                        },
                                                        children: args.rowData.deptname
                                                    }
                                                }
                                            },
                                            {
                                                title: '参与项目',
                                                width: 150,
                                                cellRender: (args) => {

                                                    return {
                                                        tag: 'a',
                                                        children: args.rowData.cdeProjectCount,
                                                        attrs: {
                                                            onclick: function () {
                                                                showModal(`/api/institutiondb/center/by-org/get-search-cdeproj-list`, args);
                                                            },
                                                        },

                                                    }
                                                }
                                            },

                                            {
                                                title: '牵头项目',
                                                width: 120,
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        children: args.rowData.teamLeaderCount,
                                                        attrs: {
                                                            onclick: function () {
                                                                showModal(`/api/institutiondb/center/by-org/get-search-teamleader-list`, args);
                                                            },
                                                        },
                                                    }
                                                }
                                            },


                                            {
                                                title: '电话',
                                                field: 'telephone',
                                                cellRender: (args) => {
                                                    return `非公开`
                                                }
                                                //field: 'telephone'
                                            },
                                            {
                                                title: '邮箱',
                                                field: 'email',
                                                cellRender: (args) => {
                                                    return `非公开`
                                                }
                                                //field: 'email'
                                            },

                                        ]

                                    },
                                    {
                                        component: 'Pager',
                                        ref: (c) => (searchpagerRef = c),
                                        onPageChange: function (e) {
                                            const pagerParams = searchpagerRef.getPageParams()
                                            asyncMainSearch({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                        }
                                    }],
                                },
                            },
                            {
                                item: { text: '申办方' },
                                panel: {
                                    children: [{
                                        component: 'Grid',
                                        ellipsis: 'both',
                                        columnResizable: true,
                                        columnsCustomizable: true,
                                        ref: c => {
                                            gridRef3 = c
                                        },
                                        columns: [
                                            {
                                                title: '申办方名称',
                                                field: 'name',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        attrs: {
                                                            target: '_blank',
                                                            href: `#!research/sponsordetail?SponsorId=${args.rowData.sponsorId}`
                                                        },
                                                        children: args.rowData.name
                                                    }
                                                }
                                            },
                                            {
                                                title: '参与项目',
                                                field: 'cdeProjectCount',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        children: args.rowData.cdeProjectCount,
                                                        attrs: {
                                                            onclick: function () {
                                                                showModal(`/api/institutiondb/center/by-org/get-sponsorcde-list`, args);
                                                            },
                                                        },

                                                    }
                                                }
                                            },

                                            {
                                                title: '牵头项目',
                                                field: 'teamLeaderCount',
                                                cellRender: (args) => {
                                                    return {
                                                        tag: 'a',
                                                        children: args.rowData.teamLeaderCount,
                                                        attrs: {
                                                            onclick: function () {
                                                                showModal(`/api/institutiondb/center/by-org/get-sponsorteamleader-list`, args);
                                                            },
                                                        },
                                                    }
                                                }
                                            },
                                            {
                                                title: '电话',
                                                field: 'telephone'
                                            },
                                            {
                                                title: '邮箱',
                                                field: 'email'
                                            },

                                        ]

                                    },
                                    {
                                        component: 'Pager',
                                        ref: (c) => (pagerRef3 = c),
                                        onPageChange: function (e) {
                                            const pagerParams = pagerRef3.getPageParams()
                                            asyncSearchCenterProject3({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                        }
                                    }],
                                },
                            },
                            {
                                item: { text: '适应症' },
                                panel: {
                                    children: [
                                        {
                                            component: 'Form',
                                            ref: (c) => {
                                                searchtextRef = c
                                            },
                                            fields: [{
                                                component: 'Textbox',
                                                name: 'simplesearch',
                                                span: '7',
                                                placeholder: '请输入适应症名称',

                                                button: {
                                                    rightIcon: 'search',
                                                    onClick: () => {
                                                        asyncSearchCenterProject4({ PageIndex: 1, PageSize: 10,  });
                                                    },
                                                },
                                                onEnter: (args) => {
                                                    asyncSearchCenterProject4({ PageIndex: 1, PageSize: 10 });
                                                }

                                            },
                                            {
                                                component: 'RadioList',
                                                name: 'publishedDate',
                                                label: '试验公式日期',
                                                classes: {
                                                    testformuladate: true
                                                },
                                                value: 0,
                                                options: [
                                                    { text: '全部', value: 0 },
                                                    { text: '近一年', value: 1 },
                                                    { text: '近三年', value: 3 },
                                                    { text: '近五年', value: 5 },
                                                ],
                                                onValueChange: (args) => {
                                                    asyncSearchCenterProject4({ PageIndex: 1, PageSize: 10 });
                                                }
                                            }]
                                        },
                                        {
                                            component: 'Grid',
                                            ellipsis: 'both',
                                            columnResizable: true,
                                            columnsCustomizable: true,
                                            ref: c => {
                                                gridRef4 = c
                                            },
                                            onSort: ({ field, sortDirection }) => {
                                                const pagerParams = pagerRef4.getPageParams();
                                                const sortParams = { field: field, order: sortDirection };
                                                asyncSearchCenterProject4({ ...pagerParams, ...sortParams })

                                            },
                                            columns: [
                                                {
                                                    title: '适应症',
                                                    field: 'name',

                                                },
                                                {
                                                    title: '全部项目',
                                                    sortable: true,
                                                    field: 'cdeProjectCount',
                                                    cellRender: (args) => {
                                                        return {
                                                            tag: 'a',
                                                            children: args.rowData.cdeProjectCount,
                                                            attrs: {
                                                                onclick: function () {
                                                                    showModal(`/api/institutiondb/center/by-org/get-indicationcde-list`, args);
                                                                },
                                                            },

                                                        }
                                                    }
                                                },
                                                {
                                                    title: '进行中项目',
                                                    sortable: true,
                                                    field: 'projectingCount',
                                                    cellRender: (args) => {
                                                        return {
                                                            tag: 'a',
                                                            children: args.rowData.projectingCount,
                                                            attrs: {
                                                                onclick: function () {
                                                                    showModal(`/api/institutiondb/center/by-org/get-indicationprojecting-list`, args);
                                                                },
                                                            },
                                                        }
                                                    }
                                                },
                                                {
                                                    title: '牵头项目',
                                                    sortable: true,
                                                    field: 'teamLeaderCount',
                                                    cellRender: (args) => {
                                                        return {
                                                            tag: 'a',
                                                            children: args.rowData.teamLeaderCount,
                                                            attrs: {
                                                                onclick: function () {
                                                                    showModal(`/api/institutiondb/center/by-org/get-indicationteamleader-list`, args);
                                                                },
                                                            },
                                                        }
                                                    }
                                                },

                                            ]

                                        },
                                        {
                                            component: 'Pager',
                                            ref: (c) => (pagerRef4 = c),
                                            onPageChange: function (e) {
                                                const pagerParams = pagerRef4.getPageParams()
                                                asyncSearchCenterProject4({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                            }
                                        }],
                                },
                            },

                        ],
                        _rendered: function () {
                            this.tabList.element.classList.add('sticky')
                        }
                    },
                    {
                        component: 'Rows',
                        attrs: {
                            style: {
                                'margin-left': '20px',
                                'margin-right': '110px',
                            }

                        },
                        items: [{
                            component: 'Cols',
                            items: [
                                {
                                    attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' }
                                },
                                {
                                    ref: (c) => {
                                        comcountRef = c;
                                    },

                                },

                            ]
                        },
                        {
                            component: 'Cols',
                            strechIndex: 1,
                            items: [{
                                tag: "img",
                                ref: (c) => {
                                    firstpublishRef = c;
                                },
                                attrs: {
                                    src: '/Assets/img/avatar.png',
                                    style: {
                                        width: "50px",
                                        height: "50px",
                                    }
                                },
                                styles: {
                                    shape: "circle",
                                },
                            },
                            {
                                component: 'Rows',
                                items: [
                                    {
                                        component: 'MultilineTextbox',
                                        placeholder: '评论内容(上限2000)',
                                        ref: c => {
                                            firsttextareaRef = c
                                        },
                                        maxLength: 2000,
                                        autoSize: {
                                            minRows: 4,
                                            maxRows: 8
                                        }
                                    },
                                    {
                                        component: 'Cols',
                                        attrs: {
                                            style: {
                                                'justify-content': 'flex-end',
                                            }
                                        },
                                        items: [{
                                            component: 'Button',
                                            text: '发表',
                                            type: 'primary',
                                            onClick: (args) => {
                                                FirstPublishComment();
                                            },
                                        }]

                                    }],
                            }]
                        }]
                    },
                    {
                        component: 'List',
                        cols: '1',
                        ref: c => {
                            commentref = c
                        },
                        onCreated() {
                            asyncCommentlist();
                        },
                        attrs: {
                            style: {
                                'margin-left': '20px',
                                'margin-right': '110px',
                            }

                        },
                    }
                ],
            }

        }
    }
});








