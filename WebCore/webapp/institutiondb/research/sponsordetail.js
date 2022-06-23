define(['wetrial-chart', 'utils'], function (WetrialChart, utils) {
    let headRef, tabRef, overviewRef, testtabRef,
        gridRef, pagerRef, chartref,
        teststageRef, classifyRef, columyearRef,
        cooperatetabRef, pagermodelgridRef, breadRef,
        lineyearRef, colummonthRef, fieldref, orderref,
        linemonthRef, coporggridRef, coppersongridRef,
        coporgpageref, coppersonpageref,
        drugRef, teststatusRef, emptyRef, modalgridRef;

    const data = []
    const yeardata = []
    const monthdata = []
    let chartcount = 0

    return function () {
        const query = this.$route.query
        const user = nomapp.context.User
        const asyncSearchCenterProject = function (params) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-clinical-detail`, { params: searchParams, loading: true }).then((response) => {
                const { currentPage, totalItems, items } = response
                gridRef.update({ data: items })
                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage })
                //项目数为0显示暂无数据：
                if (totalItems == 0) {
                    chartref.hide()
                    emptyRef.show()
                } else {
                    chartref.show()
                    emptyRef.hide()
                }
            })
        }
        const asyncHeadDetail = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-sponsor-head-detail`, { params: searchParams, loading: true }).then((response) => {
                if (response.items.length > 0) {
                    const { name, id, address, contactPhone, contacts, recordNo, email } = response.items[0]
                    let titles = name + '-机构数据库-WeTrial'
                    document.title = titles

                    headRef.update({
                        items: [
                            {
                                tag: 'span',
                                attrs: {
                                    style: {
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                    },
                                },
                                children: name,
                            },
                            {
                                tag: 'span',
                                children: address,
                            },
                        ],
                    })
                    overviewRef.update({
                        items: [
                            {
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            attrs: { style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;' },
                                        },
                                        {
                                            children: '基本信息',
                                        },
                                    ],
                                },
                            },
                            {
                                component: 'List',
                                gutter: 'md',
                                attrs: {
                                    style: {
                                        paddingLeft: '20px',
                                    },
                                },
                                cols: 1,
                                items: [
                                    {
                                        children: {
                                            component: 'Cols',
                                            items: [
                                                {
                                                    tag: 'span',
                                                    children: '联系人',
                                                },
                                                {
                                                    tag: 'span',
                                                    children: contacts,
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: 'span',
                                                    children: '联系方式',
                                                },
                                                {
                                                    tag: 'span',
                                                    children: contactPhone,
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: 'span',
                                                    children: '联系邮箱',
                                                },
                                                {
                                                    tag: 'span',
                                                    children: email,
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        children: {
                                            component: 'Cols',
                                            strechIndex: 1,
                                            items: [
                                                {
                                                    tag: 'span',
                                                    children: '邮编',
                                                },
                                                {
                                                    tag: 'span',
                                                    children: recordNo,
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    })

                    breadRef.update({
                        items: [{
                            text: '首页',
                            url: '#!dashboard'
                        },
                        {
                            text: name,
                        }]
                    });
                }
            })
        }

        const asyncTestStatusChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststatus-chart`, { params: searchParams, loading: true }).then((response) => {

                teststatusRef.changeData(response)
            })
        }

        const asyncTestStageChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststage-chart`, { params: searchParams, loading: true }).then((response) => {

                teststageRef.changeData(response)
            })
        }

        const asyncDrugChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-drug-chart`, { params: searchParams, loading: true }).then((response) => {

                drugRef.changeData(response)
            })
        }

        const asyncClassifyChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-classify-chart`, { params: searchParams, loading: true }).then((response) => {

                classifyRef.changeData(response)
            })
        }

        let obj = {}
        const addstudyphaseYear = (response) => {
            yeardata.length = 0
            if (response.length == 0) {
                return
            }
            else {
                if (response.length > 5) {
                    const studyPhasearry = []
                    for (var j = 0; j < response.length; j++) {
                        if (response[j].type == response[0].type) {
                            studyPhasearry.push(response[j].studyPhase)
                        } else {
                            break
                        }
                    }
                    if ($.inArray('I期', studyPhasearry) == -1) {
                        obj.type = response[0].type
                        obj.chartCount = 0
                        obj.studyPhase = 'I期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('II期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.type = response[0].type
                        obj.chartCount = 0
                        obj.studyPhase = 'II期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('III期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.type = response[0].type
                        obj.chartCount = 0
                        obj.studyPhase = 'III期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('IV期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.type = response[0].type
                        obj.chartCount = 0
                        obj.studyPhase = 'IV期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('其他', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.type = response[0].type
                        obj.chartCount = 0
                        obj.studyPhase = '其他'
                        yeardata.push(obj)
                    }
                }
            }

            for (var i = 0; i < response.length; i++) {
                obj = new Object()
                obj.type = response[i].type
                obj.chartCount = response[i].chartCount
                obj.studyPhase = response[i].studyPhase
                if (response[i].type == response[0].type) {
                    yeardata.splice(response[i].chartSort, 0, obj)
                } else {
                    yeardata.push(obj)
                }
            }
        }

        const addstudyphaseMonth = (response) => {
            monthdata.length = 0
            if (response.length == 0) {
                return
            } else {
                if (response.length > 5) {
                    const studyPhasearry = []
                    for (var j = 0; j < response.length; j++) {
                        if (response[j].name == response[0].name) {
                            studyPhasearry.push(response[j].studyPhase)
                        } else {
                            break
                        }
                    }
                    if ($.inArray('I期', studyPhasearry) == -1) {
                        obj.name = response[0].name
                        obj.chartCount = 0
                        obj.studyPhase = 'I期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('II期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.name = response[0].name
                        obj.chartCount = 0
                        obj.studyPhase = 'II期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('III期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.name = response[0].name
                        obj.chartCount = 0
                        obj.studyPhase = 'III期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('IV期', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.name = response[0].name
                        obj.chartCount = 0
                        obj.studyPhase = 'IV期'
                        yeardata.push(obj)
                    }
                    if ($.inArray('其他', studyPhasearry) == -1) {
                        obj = new Object()
                        obj.name = response[0].name
                        obj.chartCount = 0
                        obj.studyPhase = '其他'
                        yeardata.push(obj)
                    }
                }
            }

            for (var i = 0; i < response.length; i++) {
                obj = new Object()
                obj.name = response[i].name
                obj.chartCount = response[i].chartCount
                obj.studyPhase = response[i].studyPhase
                if (response[i].name == response[0].name) {
                    monthdata.splice(response[i].chartSort, 0, obj)
                } else {
                    monthdata.push(obj)
                }
            }
        }

        const asyncYearChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-year-chart`, { params: searchParams, loading: true }).then((response) => {

                addstudyphaseYear(response)
                columyearRef.changeData(yeardata)
                lineyearRef.changeData(yeardata)
            })
        }

        const asyncMonthChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-month-chart`, { params: searchParams, loading: true }).then((response) => {

                addstudyphaseMonth(response)
                colummonthRef.changeData(monthdata)
                linemonthRef.changeData(monthdata)
            })
        }

        const countdown = () => {
            let myDate = new Date()
            let year = myDate.getFullYear()
            let month = myDate.getMonth() + 1
            let date = myDate.getDate()

            let h = myDate.getHours()
            let m = myDate.getMinutes()
            let s = myDate.getSeconds()
            let now = year + getNow(month) + getNow(date) + getNow(h) + getNow(m) + getNow(s)
            return now
        }

        const getNow = (s) => {
            return s < 10 ? '0' + s : s
        }

        const handleExport = (params) => {
            if (user == null) {
                localStorage.setItem('lasturl', window.location.href)
                location.href = '/Account/Login/#institutiondb'
                return
            }
            const curtime = countdown()
            const searchParams = { ...query, ...params }
            utils.downloadFile({
                url: `/api/institutiondb/center/by-org/export-res-clinical`,
                data: searchParams,
                ext: '.xlsx',
                name: '临研试验_' + curtime,
            })
        }

        const asyncCopOrg = (params) => {
            const sortParams = { field: fieldref, order: orderref };
            const searchParams = { ...params, ...query, ...sortParams }
            axios.get(`/api/institutiondb/center/by-org/get-cop-org`, { params: searchParams, loading: true })
                .then(response => {
                    const { currentPage, totalItems, items } = response;

                    coporggridRef.update({ data: items });

                    coporgpageref.update({ totalCount: totalItems, pageIndex: currentPage });

                })
        }

        const asyncCopPerson = (params) => {
            const sortParams = { field: fieldref, order: orderref };
            const searchParams = { ...params, ...query, ...sortParams }
            axios.get(`/api/institutiondb/center/by-org/get-cop-person`, { params: searchParams, loading: true })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    coppersongridRef.update({ data: items })
                    coppersonpageref.update({ totalCount: totalItems, pageIndex: currentPage });

                });
        }


        //弹框
        let innerheight = window.innerHeight - 360 + 'px';
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
                                                            href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SponsorId=' + query.SponsorId,
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
                                                            href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SponsorId=' + query.SponsorId,
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
                                            asyncModal({ url: url, PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize, SiteID: args.rowData.id, piId: args.rowData.piId })
                                        }
                                    }

                                ],
                                onCreated: () => {
                                    asyncModal({ url: url, PageIndex: 1, PageSize: 10, SiteID: args.rowData.id, piId: args.rowData.piId });
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
            const searchParams = { ...params, ...query }
            axios.get(searchParams.url, { params: searchParams, loading: true })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    modalgridRef.update({ data: items })
                    pagermodelgridRef.update({ totalCount: totalItems, pageIndex: currentPage });
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
                        component: 'Rows',
                        attrs: {
                            style: {
                                paddingLeft: '20px',
                            },
                        },
                        ref: (c) => {
                            headRef = c
                        },
                    },
                    {
                        component: 'Tabs',
                        attrs: {
                            style: {
                                'padding-left': '20px',
                                'padding-bottom': '20px'
                            },
                        },
                        ref: (c) => {
                            tabRef = c
                        },
                        tabs: [
                            {
                                item: { text: '概况' },
                                panel: {
                                    children: {
                                        component: 'Rows',
                                        ref: (c) => {
                                            overviewRef = c
                                        },
                                    },
                                },
                            },
                            {
                                item: { text: '试验' },
                                panel: {
                                    children: {
                                        component: 'Tabs',
                                        ref: (c) => {
                                            testtabRef = c
                                        },
                                        tabs: [
                                            {
                                                item: { text: '试验信息' },
                                                panel: {
                                                    children: [
                                                        {
                                                            component: 'Rows',
                                                            items: [
                                                                {
                                                                    children: {
                                                                        component: 'Cols',
                                                                        justify: 'end',
                                                                        attrs: {
                                                                            style: {
                                                                                paddingRight: '5px',
                                                                            },
                                                                        },
                                                                        items: [
                                                                            {
                                                                                children: {
                                                                                    component: 'Button',
                                                                                    text: '导出',
                                                                                    tooltip: '导出Excel',
                                                                                    onClick: () => {
                                                                                        handleExport({ ...{ PageIndex: 1, PageSize: 999999 } })
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    component: 'Grid',
                                                                    ellipsis: 'both',
                                                                    ref: (c) => {
                                                                        gridRef = c
                                                                    },
                                                                    _created() {
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
                                                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SponsorId=' + query.SponsorId,
                                                                                    },
                                                                                    children: args.rowData.registrationNo,
                                                                                }
                                                                            },
                                                                        },
                                                                        {
                                                                            title: '试验名称',
                                                                            ellipsis: true,
                                                                            field: 'popularTitle',
                                                                            cellRender: (args) => {
                                                                                return {
                                                                                    tag: 'a',
                                                                                    attrs: {
                                                                                        title: args.rowData.popularTitle,
                                                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&SponsorId=' + query.SponsorId,
                                                                                    },
                                                                                    children: args.rowData.popularTitle,
                                                                                }
                                                                            },
                                                                        },
                                                                        {
                                                                            field: 'drugName',
                                                                            title: '研究药物',
                                                                        },
                                                                        {
                                                                            field: 'indication',
                                                                            title: '适应症',
                                                                            ellipsis: true,
                                                                        },
                                                                        {
                                                                            field: 'sponsorName',
                                                                            title: '申办方',
                                                                            ellipsis: true,
                                                                        },
                                                                        {
                                                                            field: 'studyPhase',
                                                                            title: '试验分期',
                                                                        },
                                                                        {
                                                                            field: 'publishedDate',
                                                                            title: '首次公示日期',
                                                                        },
                                                                        {
                                                                            field: 'studyStatus',
                                                                            title: '试验状态',
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    component: 'Pager',
                                                                    ref: (c) => (pagerRef = c),
                                                                    onPageChange: function (e) {
                                                                        const pagerParams = pagerRef.getPageParams()
                                                                        asyncSearchCenterProject({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    ]
                                                },
                                            },
                                            {
                                                item: { text: '图表分析' },
                                                panel: {
                                                    children: [
                                                        {
                                                            ref: (c) => {
                                                                chartref = c
                                                            },
                                                            children: {
                                                                component: 'Rows',
                                                                items: [
                                                                    {
                                                                        children: {
                                                                            component: 'Cols',
                                                                            gutter: 'md',
                                                                            justify: 'around',
                                                                            items: [
                                                                                {
                                                                                    component: 'Rows',
                                                                                    items: [
                                                                                        {
                                                                                            children: {
                                                                                                component: 'Caption',
                                                                                                title: '试验分期',
                                                                                                classes: {
                                                                                                    'u-justify-center': true,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            children: {
                                                                                                component: WetrialChart,

                                                                                                type: 'Pie',
                                                                                                ref: (c) => {
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
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },

                                                                                {
                                                                                    component: 'Rows',
                                                                                    items: [
                                                                                        {
                                                                                            children: {
                                                                                                component: 'Caption',
                                                                                                title: '试验分类',
                                                                                                classes: {
                                                                                                    'u-justify-center': true,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            children: {
                                                                                                component: WetrialChart,

                                                                                                type: 'Pie',
                                                                                                ref: (c) => {
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
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                    {
                                                                        component: 'Rows',
                                                                        items: [
                                                                            {
                                                                                children: {
                                                                                    component: 'Caption',
                                                                                    title: '试验时间趋势分析图',
                                                                                    classes: {
                                                                                        'u-justify-center': true,
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                component: 'Tabs',
                                                                                uistyle: 'pill',
                                                                                classes: {
                                                                                    'u-justify-center-tab': true,
                                                                                },
                                                                                tabs: [
                                                                                    {
                                                                                        item: { text: '按年' },
                                                                                        panel: {
                                                                                            children: {
                                                                                                component: 'Cols',
                                                                                                gutter: 'md',
                                                                                                justify: 'around',
                                                                                                items: [
                                                                                                    {
                                                                                                        component: WetrialChart,
                                                                                                        type: 'Column',
                                                                                                        ref: (c) => {
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
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                    {
                                                                                                        component: WetrialChart,
                                                                                                        type: 'Line',
                                                                                                        ref: (c) => {
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
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                ],
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        item: { text: '按月' },
                                                                                        panel: {
                                                                                            children: {
                                                                                                component: 'Cols',
                                                                                                gutter: 'md',
                                                                                                justify: 'around',
                                                                                                items: [
                                                                                                    {
                                                                                                        component: WetrialChart,
                                                                                                        type: 'Column',
                                                                                                        ref: (c) => {
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
                                                                                                            },
                                                                                                        },
                                                                                                    },
                                                                                                    {
                                                                                                        component: WetrialChart,
                                                                                                        type: 'Line',
                                                                                                        ref: (c) => {
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
                                                                                                            },
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
                                                                    {
                                                                        attrs: {
                                                                            style: {
                                                                                'margin-top': '50px',
                                                                            },
                                                                        },
                                                                        children: {
                                                                            component: 'Cols',
                                                                            gutter: 'md',
                                                                            justify: 'around',
                                                                            items: [
                                                                                {
                                                                                    component: 'Rows',
                                                                                    items: [
                                                                                        {
                                                                                            children: {
                                                                                                component: 'Caption',
                                                                                                title: '药物分类',
                                                                                                classes: {
                                                                                                    'u-justify-center': true,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            children: {
                                                                                                component: WetrialChart,

                                                                                                type: 'Bar',
                                                                                                ref: (c) => {
                                                                                                    drugRef = c
                                                                                                },
                                                                                                chartProps: {
                                                                                                    data,
                                                                                                    xField: 'chartCount',
                                                                                                    yField: 'drugClassification',
                                                                                                    seriesField: 'drugClassification',
                                                                                                    legend: false,
                                                                                                    maxBarWidth: 20,
                                                                                                    width: 400,
                                                                                                    label: {
                                                                                                        position: 'middle', // 'top', 'bottom', 'middle'
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    component: 'Rows',
                                                                                    items: [
                                                                                        {
                                                                                            children: {
                                                                                                component: 'Caption',
                                                                                                title: '试验状态',
                                                                                                classes: {
                                                                                                    'u-justify-center': true,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            children: {
                                                                                                component: WetrialChart,
                                                                                                type: 'Bar',
                                                                                                ref: (c) => {
                                                                                                    teststatusRef = c
                                                                                                },
                                                                                                chartProps: {
                                                                                                    data,
                                                                                                    xField: 'chartCount',
                                                                                                    yField: 'studyStatus',
                                                                                                    seriesField: 'studyStatus',
                                                                                                    legend: false,
                                                                                                    maxBarWidth: 20,
                                                                                                    width: 400,
                                                                                                    label: {
                                                                                                        position: 'middle', // 'top', 'bottom', 'middle'
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                            onCreated: () => {
                                                                asyncTestStageChart();//试验分期
                                                                asyncClassifyChart();//试验分类
                                                                asyncDrugChart();//药物分类
                                                                asyncTestStatusChart();//试验状态
                                                                asyncYearChart();//试验年趋势分析
                                                                asyncMonthChart();//月
                                                            },
                                                        },
                                                        {
                                                            component: 'Empty',
                                                            ref: (c) => {
                                                                emptyRef = c
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                item: { text: '合作关系' },
                                panel: {
                                    children: {
                                        component: 'Tabs',
                                        ref: (c) => {
                                            cooperatetabRef = c
                                        },
                                        tabs: [
                                            {
                                                item: { text: '合作机构' },
                                                panel: {
                                                    children: {
                                                        component: 'Rows',
                                                        items: [
                                                            {
                                                                component: 'Grid',
                                                                ellipsis: 'both',
                                                                ref: (c) => {
                                                                    coporggridRef = c
                                                                },
                                                                onSort: ({ field, sortDirection }) => {
                                                                    const pagerParams = coporgpageref.getPageParams();
                                                                    fieldref = field;
                                                                    orderref = sortDirection;
                                                                    asyncCopOrg({ ...pagerParams });
                                                                },
                                                                _created() {
                                                                    asyncCopOrg({ PageIndex: 1, PageSize: 10 })
                                                                },
                                                                columnResizable: true,
                                                                columnsCustomizable: true,
                                                                columns: [
                                                                    {
                                                                        title: '机构名称',
                                                                        field: 'studySiteName',
                                                                        width: 300,
                                                                        cellRender: (args) => {
                                                                            let beian = null;
                                                                            if (args.rowData.recordNo != null) {
                                                                                beian = '药物备案';
                                                                            }
                                                                            let jixie = null;
                                                                            if (args.rowData.isInstrument == true) {
                                                                                jixie = '机械备案';
                                                                            }
                                                                            let jidi = null;
                                                                            if (args.rowData.isPhaseOne == true) {
                                                                                jidi = 'I期基地';
                                                                            }

                                                                            return {
                                                                                tag: 'div',
                                                                                children: {
                                                                                    component: 'Rows',
                                                                                    items: [{
                                                                                        tag: 'a',
                                                                                        classes: {
                                                                                            vistedlink: true
                                                                                        },
                                                                                        attrs: {
                                                                                            target: '_blank',
                                                                                            style: {
                                                                                                'font-size': '16px',
                                                                                                'font-weight': 'bold',
                                                                                            },
                                                                                            title: args.rowData.studySiteName,
                                                                                            href: `#!research/organizedetail?SiteId=${args.rowData.id}&v=${new Date().getTime()}`
                                                                                        },
                                                                                        children: args.rowData.studySiteName,
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        children: [
                                                                                            args.rowData.levelName !== null && {
                                                                                                children: {
                                                                                                    component: 'Tag',
                                                                                                    size: 'xs',
                                                                                                    text: args.rowData.levelName,
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
                                                                                    }],
                                                                                },

                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        title: '区域',
                                                                        field: 'provinceName',
                                                                        sortable: true,
                                                                        cellRender: (args) => {
                                                                            let area = '';
                                                                            if (args.rowData.provinceName != null && args.rowData.cityName != null) {
                                                                                area = args.rowData.provinceName + '/' + args.rowData.cityName;
                                                                            }
                                                                            else if (args.rowData.provinceName != null && args.rowData.cityName == null) {
                                                                                area = args.rowData.provinceName
                                                                            }

                                                                            return `${area}`
                                                                        }
                                                                    },

                                                                    {
                                                                        title: '全部项目',
                                                                        field: 'cdeProjectCount',

                                                                        sortable: true,
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
                                                                        title: '进行中项目',
                                                                        field: 'projectingCount',
                                                                        sortable: true,

                                                                        cellRender: (args) => {

                                                                            return {
                                                                                tag: 'a',
                                                                                children: args.rowData.projectingCount,
                                                                                attrs: {
                                                                                    onclick: function () {
                                                                                        showModal(`/api/institutiondb/center/by-org/get-sponsorprojecting-list`, args);

                                                                                    },
                                                                                },
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        title: '牵头项目',
                                                                        field: 'teamLeaderCount',
                                                                        sortable: true,

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
                                                                    }
                                                                ],
                                                            },
                                                            {
                                                                component: 'Pager',
                                                                ref: (c) => (coporgpageref = c),
                                                                onPageChange: function (e) {
                                                                    const pagerParams = coporgpageref.getPageParams()
                                                                    asyncCopOrg({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                                                },
                                                            },
                                                        ],
                                                    },

                                                },
                                            },
                                            {
                                                item: { text: '合作研究者' },
                                                panel: {
                                                    children: {
                                                        component: 'Rows',
                                                        items: [
                                                            {
                                                                component: 'Grid',
                                                                ellipsis: 'both',
                                                                ref: (c) => {
                                                                    coppersongridRef = c
                                                                },
                                                                onSort: ({ field, sortDirection }) => {
                                                                    const pagerParams = coporgpageref.getPageParams();
                                                                    fieldref = field;
                                                                    orderref = sortDirection;
                                                                    asyncCopPerson({ ...pagerParams });
                                                                },
                                                                _created() {
                                                                    asyncCopPerson({ PageIndex: 1, PageSize: 10 })
                                                                },
                                                                columnResizable: true,
                                                                columnsCustomizable: true,
                                                                columns: [
                                                                    {
                                                                        title: '姓名',
                                                                        field: 'name',
                                                                        cellRender: (args) => {
                                                                            return {
                                                                                tag: 'a',
                                                                                attrs: {
                                                                                    target: '_blank',
                                                                                    href: `#!research/resdetail?SiteId=${args.rowData.id}&PIId=${args.rowData.piId}`
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
                                                                        title: '机构名称',
                                                                        field: 'studySiteName',
                                                                        cellRender: (args) => {
                                                                            return {
                                                                                tag: 'a',
                                                                                attrs: {
                                                                                    target: '_blank',
                                                                                    title: args.rowData.studySiteName,
                                                                                    href: `#!research/organizedetail?SiteId=${args.rowData.id}&v=${new Date().getTime()}`
                                                                                },
                                                                                children: args.rowData.studySiteName
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        title: '科室',
                                                                        field: 'deptname',
                                                                        cellRender: (args) => {
                                                                            return {
                                                                                tag: 'a',
                                                                                attrs: {
                                                                                    target: '_blank',
                                                                                    title: args.rowData.deptname,
                                                                                    href: `#!research/departdetail?SiteId=${args.rowData.id}&deptId=${args.rowData.deptId}`
                                                                                },
                                                                                children: args.rowData.deptname
                                                                            }
                                                                        }
                                                                    },

                                                                    {
                                                                        title: '全部项目(合作)',
                                                                        field: 'cdeProjectCount',
                                                                        sortable: true,

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
                                                                        title: '进行中项目(合作)',
                                                                        field: 'projectingCount',
                                                                        sortable: true,
                                                                        cellRender: (args) => {

                                                                            return {
                                                                                tag: 'a',
                                                                                children: args.rowData.projectingCount,
                                                                                attrs: {
                                                                                    onclick: function () {
                                                                                        showModal(`/api/institutiondb/center/by-org/get-sponsorprojecting-list`, args);
                                                                                    },
                                                                                },
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        title: '牵头项目(合作)',
                                                                        field: 'teamLeaderCount',
                                                                        sortable: true,
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
                                                                    }

                                                                ]
                                                            },
                                                            {
                                                                component: 'Pager',
                                                                ref: (c) => (coppersonpageref = c),
                                                                onPageChange: function (e) {
                                                                    const pagerParams = coppersonpageref.getPageParams()
                                                                    asyncCopPerson({ PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize })
                                                                },
                                                            },
                                                        ],
                                                    }
                                                },
                                            },
                                        ],
                                    },
                                },
                            }
                        ],
                    },
                ],
                onRendered() {
                    asyncHeadDetail()
                },
            },
        }
    }
})
