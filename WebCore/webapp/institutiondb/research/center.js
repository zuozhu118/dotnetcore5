define(["wetrial-chart", "utils"], function (WetrialChart, utils) {

    let gridRef0, gridRef1, gridRef2,
        gridRef3, rowRef0, rowRef1,
        rowRef3, searchtextRef, exportbtnRef,
        chartref, teststatusRef, teststageRef,
        classifyRef, drugRef,
        tabRef2, emptyRef,
        columyearRef, lineyearRef,
        colummonthRef, linemonthRef,
        groups, pagerRef, spideruptimeRef,
        provinceRef, cityRef,
        selectRef, simplegroups,
        fieldref, orderref, issortref,
        indicationtypeRef, startdateRef,
        enddateRef, yeargroupRef,
        totalRef, 
        modalgridRef, pagermodelgridRef;

    let innerheight = window.innerHeight - 360 + 'px';
    const user = nomapp.context.User;
    let begincolms = null;
    let searchtype = 0;
    let simplegroupsearch = {};
    let seniorgroupsearch = {};
    //searchtype:0简单搜索，1高级搜索；

    let resultcount = 0;
    const data = [];
    const yeardata = [];
    const monthdata = [];


    let selectedtab;
    const asyncSearchCenterProject0 = (params) => {
        totalRef.update({ value: '' });

        const formParams = seniorgroupsearch;
        if (formParams.studySiteName == null && formParams.proname == null && formParams.researcher == null && formParams.sponsorName == null && formParams.indication == null && formParams.drugName == null) {
            exportbtnRef.hide();
        }
        else {
            exportbtnRef.show();
        }

        if (begincolms == null) {
            begincolms = gridRef0.props.columns;
        }
        let columns = begincolms;
        for (let j = 0; j < columns.length; j++) {
            columns[j].sortDirection = null;
        }
        for (let i = 0; i < columns.length; i++) {
            if (fieldref == columns[i].field) {
                columns[i].sortDirection = orderref;
                break;
            }
        }
        if (formParams.proname == null && formParams.researcher == null) {
            columns = columns.filter((item, idx) => {
                return !(item.field == "deptname" || item.field == "researchName");
            });
        }
        else if (formParams.proname != null && formParams.researcher == null) {
            columns = columns.filter((item, idx) => {
                return !(item.field == "researchName");
            });
        }

        gridRef0.update({ visibleColumns: columns });
        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...formParams.address, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-research-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;

                gridRef0.update({ data: items });

                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });

                if (issortref == true) {
                    gridRef0.resetSort();
                }

                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 家符合机构` });
                }
            })
    }

    const asyncSearchCenterProject1 = (params) => {
        totalRef.update({ value: '' });

        const formParams = seniorgroupsearch;
        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...formParams.address, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-search-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef1.update({ data: items })
                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });
                if (issortref == true) {
                    gridRef1.resetSort();
                }

                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合研究者` });
                }
               
            })
    }

    const asyncSearchCenterProject2 = (params) => {
        totalRef.update({ value: '' });

        const formParams = seniorgroupsearch;
        const filterParams = gridRef2.filter;
        //params.sender = undefined;
        filterParams.sender = undefined;
        const searchParams = { ...params, ...formParams, ...formParams.address, ...filterParams }
        axios.get(`/api/institutiondb/center/by-org/get-clinical-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef2.update({ data: items })
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

                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合试验` });
                }

            })
    }

    const asyncSearchCenterProject3 = (params) => {

        totalRef.update({ value: '' });

        const formParams = seniorgroupsearch;
        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...formParams.address, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-sponsor-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef3.update({ data: items })
                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });

                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合申办方` });
                }


            })
    }

    const funcArray = [asyncSearchCenterProject0, asyncSearchCenterProject1, asyncSearchCenterProject2, asyncSearchCenterProject3];



    const asyncSimpleSearch0 = (params) => {
        totalRef.update({ value: '' });

        const formParams = simplegroupsearch;
        if (formParams.simplesearch == undefined) {
            exportbtnRef.hide();
        }
        else {
            exportbtnRef.show();
        }
        if (begincolms == null) {
            begincolms = gridRef0.props.columns;
        }
        let columns = begincolms;
        for (let j = 0; j < columns.length; j++) {
            columns[j].sortDirection = null;
        }
        for (let i = 0; i < columns.length; i++) {
            if (fieldref == columns[i].field) {
                columns[i].sortDirection = orderref;
                break;
            }
        }
        columns = columns.filter((item, idx) => {
            return !(item.field == "deptname" || item.field == "researchName");
        });

        gridRef0.update({ visibleColumns: columns });

        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-simpleresearch-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;

                gridRef0.update({ data: items });

                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });

                if (issortref == true) {
                    gridRef0.resetSort();
                }
                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 家符合机构` });
                }
            })
    }


    const asyncSimpleSearch1 = (params) => {
        totalRef.update({ value: '' });
        const formParams = simplegroupsearch;
        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-simplesearch-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef1.update({ data: items })
                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });
                if (issortref == true) {
                    gridRef1.resetSort();
                }
                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合研究者` });
                }
            })
    }

    const asyncSimpleSearch2 = (params) => {
        totalRef.update({ value: '' });
        const formParams = simplegroupsearch;
        const filterParams = gridRef2.filter;
        filterParams.sender = undefined;
        const searchParams = { ...params, ...formParams, ...filterParams }
        axios.get(`/api/institutiondb/center/by-org/get-simpleclinical-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef2.update({ data: items })
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
                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合试验` });
                }
            })
    }

    const asyncSimpleSearch3 = (params) => {
        totalRef.update({ value: '' });
        const formParams = simplegroupsearch;
        const sortParams = { field: fieldref, order: orderref };
        const searchParams = { ...params, ...formParams, ...sortParams }
        axios.get(`/api/institutiondb/center/by-org/get-simplesponsor-list`, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                gridRef3.update({ data: items })
                pagerRef.update({ totalCount: totalItems, pageIndex: currentPage });
                if (totalItems > 0) {
                    totalRef.update({ value: `#为您找到 <span style='color: #FF9900;font-size:18px;'>${totalItems}</span> 个符合申办方` });
                }
            })
    }

    const funcsimpleArray = [asyncSimpleSearch0, asyncSimpleSearch1, asyncSimpleSearch2, asyncSimpleSearch3];

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


    const handleSimpleExport0 = (params) => {
        if (user == null) {
            localStorage.setItem("lasturl", window.location.href);
            location.href = '/Account/Login/#institutiondb';
            return;
        }
        const curtime = countdown();
        //const formParams = simplegroups.getValue();
        const formParams = simplegroupsearch;
        const searchtypeParams = { SearchType: searchtype };
        const sortParams = { field: fieldref, order: orderref };
        const data = { ...params, ...formParams, ...sortParams, ...searchtypeParams }
        utils.downloadFile({
            url: `/api/institutiondb/center/by-org/export-research-list`,
            data: data,
            ext: ".xlsx",
            name: "研究中心_" + curtime,
        });
    };


    const handleSimpleExport2 = (params) => {
        if (user == null) {
            localStorage.setItem("lasturl", window.location.href);
            location.href = '/Account/Login/#institutiondb';
            return;
        }
        const curtime = countdown();
        //const formParams = simplegroups.getValue()
        const formParams = simplegroupsearch;
        const filterParams = gridRef2.filter;
        const searchtypeParams = { SearchType: searchtype };
        filterParams.sender = undefined;
        const data = { ...params, ...formParams, ...searchtypeParams, ...filterParams }
        utils.downloadFile({
            url: `/api/institutiondb/center/by-org/export-clinical-list`,
            data: data,
            ext: ".xlsx",
            name: "临研试验_" + curtime,
        });
    };

    const handleExport0 = (params) => {
        if (user == null) {
            localStorage.setItem("lasturl", window.location.href);
            location.href = '/Account/Login/#institutiondb';
            return;
        }
        const curtime = countdown();
        //const formParams = groups.getValue();
        const formParams = seniorgroupsearch;
        const sortParams = { field: fieldref, order: orderref };
        const data = { ...params, ...formParams, ...formParams.address, ...sortParams }
        utils.downloadFile({
            url: `/api/institutiondb/center/by-org/export-research-list`,
            data: data,
            ext: ".xlsx",
            name: "研究中心_" + curtime,
        });
    };

    const handleExport2 = (params) => {
        if (user == null) {
            localStorage.setItem("lasturl", window.location.href);
            location.href = '/Account/Login/#institutiondb';
            return;
        }
        const curtime = countdown();
        const formParams = seniorgroupsearch;
        const filterParams = gridRef2.filter;
        filterParams.sender = undefined;
        const data = { ...params, ...formParams, ...formParams.address, ...filterParams }
        utils.downloadFile({
            url: `/api/institutiondb/center/by-org/export-clinical-list`,
            data: data,
            ext: ".xlsx",
            name: "临研试验_" + curtime,
        });
    };

    //高级搜索点击事件：
    const seniorsearchClick = () => {
        seniorgroupsearch = groups.getValue();
        const pagerParams = pagerRef.getPageParams();
        let index = selectRef.getValue()
        let func = funcArray[index];
        func(pagerParams);
        searchtype = 1;
        //临床试验图表：
        GetChart();
    }

    const simplesearchClick = () => {
        simplegroupsearch = simplegroups.getValue();
        const pagerParams = pagerRef.getPageParams();
        let index = selectRef.getValue()
        let func = funcsimpleArray[index];
        func(pagerParams);
        searchtype = 0;
        //临床试验图表：
        GetChart();
    }

    const GetChart = () => {
        if (selectRef.getValue() != 2) {
            return;
        }
        if (searchtype == 0) {
            asyncSimpleTestStageChart();//试验分期
            asyncSimpleClassifyChart();//试验分类
            asyncSimpleDrugChart();//药物分类
            asyncSimpleTestStatusChart();//试验状态
            asyncSimpleYearChart();//试验年趋势分析
            asyncSimpleMonthChart();//月
        }
        else if (searchtype == 1) {
            asyncSeniorTestStatusChart();
            asyncSeniorTestStageChart();
            asyncSeniorDrugChart();
            asyncSeniorClassifyChart();
            asyncSeniorYearChart();
            asyncSeniorMonthChart();
        }
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
                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=center',
                                                    },
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
                                                        href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=center',
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
                                        asyncModal({ url: url, PageIndex: pagerParams.pageIndex, PageSize: pagerParams.pageSize, SiteId: args.rowData.studySiteId, PIId: args.rowData.piId, DeptId: args.rowData.deptId, SponsorId: args.rowData.id })
                                    }
                                }

                            ],
                            onCreated: () => {
                                asyncModal({ url: url, PageIndex: 1, PageSize: 10, SiteId: args.rowData.studySiteId, PIId: args.rowData.piId, DeptId: args.rowData.deptId, SponsorId: args.rowData.id });
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
        const formParams = seniorgroupsearch;
        const simpleformParams = simplegroupsearch;
        const searchParams = { ...params, ...formParams, ...formParams.address, ...simpleformParams }
        axios.get(searchParams.url, { params: searchParams, loading: true })
            .then(response => {
                const { currentPage, totalItems, items } = response;
                modalgridRef.update({ data: items })
                pagermodelgridRef.update({ totalCount: totalItems, pageIndex: currentPage });
            })
    }

    //图表分析简单搜索
    const asyncSimpleTestStatusChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-teststatus-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                teststatusRef.changeData(response)
            })
    }

    const asyncSimpleTestStageChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-teststage-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                teststageRef.changeData(response)

            })
    }

    const asyncSimpleDrugChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-drug-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                drugRef.changeData(response)
            })
    }

    const asyncSimpleClassifyChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-classify-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
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

    const asyncSimpleYearChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-year-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;

                addstudyphaseYear(response);
                columyearRef.changeData(yeardata)
                lineyearRef.changeData(yeardata)

            })
    }

    const asyncSimpleMonthChart = () => {
        const formParams = simplegroupsearch;
        const searchParams = { ...formParams };
        axios.get(`/api/institutiondb/center/by-org/get-simple-month-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                addstudyphaseMonth(response);
                colummonthRef.changeData(monthdata)
                linemonthRef.changeData(monthdata)

            })
    }


    //图表分析高级搜索
    const asyncSeniorTestStatusChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-teststatus-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                teststatusRef.changeData(response)

            })
    }

    const asyncSeniorTestStageChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-teststage-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                teststageRef.changeData(response)

            })
    }

    const asyncSeniorDrugChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-drug-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                drugRef.changeData(response)
            })
    }

    const asyncSeniorClassifyChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-classify-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                classifyRef.changeData(response)

            })
    }

    const asyncSeniorYearChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-year-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                addstudyphaseYear(response);
                columyearRef.changeData(yeardata)
                lineyearRef.changeData(yeardata)
            })
    }

    const asyncSeniorMonthChart = () => {
        const formParams = seniorgroupsearch;
        const searchParams = { ...formParams, ...formParams.address };
        axios.get(`/api/institutiondb/center/by-org/get-senior-month-chart`, { params: searchParams })
            .then(response => {
                resultcount += 1;
                addstudyphaseMonth(response);
                colummonthRef.changeData(monthdata)
                linemonthRef.changeData(monthdata)

            })
    }

    const SpiderUpdatedTime = () => {
        axios.get(`/api/institutiondb/center/by-org/spider-updated-time`)
            .then(response => {
                if (response[0].spiderupdatedtime != null) {
                    let strdate = response[0].spiderupdatedtime.replace('T', ' ');
                    let index = strdate.lastIndexOf(":");
                    strdate = strdate.substring(0, index);
                    spideruptimeRef.update({
                        children: `数据更新于${strdate}`
                    });
                }
            })
    }

    const DateDiff = (startdate, enddate) => {

        const diff = (new Date(enddate) - new Date(startdate)) / (1000 * 60 * 60 * 24);
        $('.yearbtn').removeClass('yearbtn');
        if (diff == 365) {
            yeargroupRef.children[1].children[0].children[0].addClass('yearbtn');
        }
        else if (diff == 365 * 3 + 1) {
            yeargroupRef.children[1].children[0].children[1].addClass('yearbtn');
        }
        else if (diff == 365 * 5 + 1) {
            yeargroupRef.children[1].children[0].children[2].addClass('yearbtn');
        }
    }

    return function () {
        const selectview = this.$route.query.view;
        const searchtext = this.$route.query.SearchText;

        return {
            title: '机构数据库-WeTrial',
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
                        component: 'Group',
                        classes: {
                            simplegroup: true
                        },
                        ref: (c) => {
                            simplegroups = c
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
                                    simplesearchClick();
                                },
                            },
                            onEnter: (args) => {
                                simplesearchClick();
                            }
                        },
                        {
                            component: 'Button',
                            text: '高级搜索',
                            type: 'link',
                            span: '1',
                            onClick: () => {
                                groups.show();
                                simplegroups.hide();
                            },
                        }],
                    },
                    {
                        component: 'Group',
                        ref: (c) => {
                            groups = c
                        },
                        attrs: {
                            style: {
                                paddingRight: '5px',
                            }
                        },
                        fields: [
                            {
                                component: 'Textbox',
                                name: 'studySiteName',
                                label: '研究中心',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },
                            {
                                component: 'Textbox',
                                name: 'proname',
                                label: '专业名称',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },
                            {
                                component: 'Textbox',
                                name: 'researcher',
                                label: '研究者',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },
                            {
                                component: 'Textbox',
                                name: 'sponsorName',
                                label: '申办方',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },
                            {
                                component: 'Group',
                                name: 'address',
                                labelWidth: 120,
                                label: '区域',
                                span: '3',
                                fields: [{
                                    component: 'Select',
                                    //allowClear: false,
                                    ref: c => {
                                        provinceRef = c
                                    },
                                    name: 'province',
                                    span: '6',
                                    onCreated: function () {
                                        axios.get(`/api/institutiondb/center/by-org/get-province-list`)
                                            .then((response) => {
                                                provinceRef.update({ options: response })
                                            })
                                    },
                                    onValueChange: function (e) {
                                        cityRef.clear();
                                        axios.get(`/api/institutiondb/center/by-org/get-city-list?provinceCode=${e.newValue}`).then((response) => {
                                            cityRef.update({ options: response })
                                        })
                                    }


                                },
                                {
                                    component: 'Select',
                                    //allowClear: false,
                                    ref: c => {
                                        cityRef = c
                                    },

                                    name: 'city',
                                    span: '6',
                                },]
                            },

                            {
                                component: 'Cascader',
                                name: 'indicationtype',
                                changeOnSelect: true,
                                label: '适应症类型',
                                ref: c => {
                                    indicationtypeRef = c
                                },
                                fieldsMapping: {
                                    key: 'id',
                                    label: 'name',
                                    value: 'id',
                                    children: 'childs',
                                },
                                span: '3',
                                labelWidth: 120,
                                onCreated: function () {
                                    axios.get(`/api/institutiondb/center/get-indicationtype-list`)
                                        .then((response) => {
                                            indicationtypeRef.update({ options: response })
                                        })
                                },
                            },
                            {
                                component: 'Textbox',
                                name: 'indication',
                                label: '适应症',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },
                            {
                                component: 'Textbox',
                                name: 'drugName',
                                label: '研究药物',
                                span: '3',
                                labelWidth: 120,
                                onEnter: (args) => {
                                    seniorsearchClick();
                                }
                            },

                            {
                                component: 'CheckboxList',
                                name: 'studyType',
                                label: '试验分类',
                                labelWidth: 120,
                                options: [
                                    { text: '安全性', value: '安全性' },
                                    { text: '有效性', value: '有效性' },
                                    { text: '安全性和有效性', value: '安全性和有效性' },
                                    { text: '生物等效性/生物利用度', value: '生物等效性/生物利用度' },
                                    { text: '药物动力学/药效动力学', value: '药物动力学/药效动力学' },
                                ],
                            },
                            {
                                component: 'CheckboxList',
                                name: 'studyPhase',
                                label: '试验分期',
                                labelWidth: 120,
                                options: [
                                    { text: 'I期', value: 'I期' },
                                    { text: 'II期', value: 'II期' },
                                    { text: 'III期', value: 'III期' },
                                    { text: 'IV期', value: 'IV期' },
                                    { text: '其他', value: '其它' },
                                ],
                            },
                            {
                                component: 'Group',
                                name: 'publishedDate',
                                labelWidth: 120,
                                label: '试验公示日期',
                                ref: c => {
                                    yeargroupRef = c
                                },
                                span: '3',
                                attrs: {
                                    style: {
                                        'align-items': 'center',
                                    }
                                },
                                fields: [{
                                    component: 'Button',
                                    text: '近一年',
                                    type: 'text',
                                    onClick: (args) => {
                                        const now = new Date();
                                        now.setFullYear(now.getFullYear() - 1)
                                        const lastYearStr = utils.formatDate(now, 'yyyy-MM-dd')
                                        startdateRef.setValue(lastYearStr);
                                        enddateRef.setValue(new Date().format('yyyy-MM-dd'));

                                        $('.yearbtn').removeClass('yearbtn')
                                        args.sender.addClass('yearbtn')
                                    },
                                },
                                {
                                    component: 'Button',
                                    text: '近三年',
                                    type: 'text',
                                    onClick: (args) => {
                                        const now = new Date();
                                        now.setFullYear(now.getFullYear() - 3)
                                        const lastYearStr = utils.formatDate(now, 'yyyy-MM-dd')
                                        startdateRef.setValue(lastYearStr);
                                        enddateRef.setValue(new Date().format('yyyy-MM-dd'));

                                        $('.yearbtn').removeClass('yearbtn')
                                        args.sender.addClass('yearbtn')
                                    },
                                },
                                {
                                    component: 'Button',
                                    text: '近五年',
                                    type: 'text',
                                    onClick: (args) => {
                                        const now = new Date();
                                        now.setFullYear(now.getFullYear() - 5)
                                        const lastYearStr = utils.formatDate(now, 'yyyy-MM-dd')
                                        startdateRef.setValue(lastYearStr);
                                        enddateRef.setValue(new Date().format('yyyy-MM-dd'));

                                        $('.yearbtn').removeClass('yearbtn')
                                        args.sender.addClass('yearbtn')
                                    },
                                }]
                            },
                            {
                                component: 'DatePicker',
                                name: 'startdate',
                                ref: c => {
                                    startdateRef = c
                                },
                                format: 'yyyy-MM-dd',
                                span: '2',
                                placeholder: '开始日期',
                                onValueChange: (args) => {
                                    const today = utils.formatDate(new Date(), 'yyyy-MM-dd')
                                    if (enddateRef.currentValue == today) {
                                        DateDiff(startdateRef.currentValue, enddateRef.currentValue);
                                    }
                                    else {
                                        $('.yearbtn').removeClass('yearbtn')
                                    }

                                }
                            },
                            {
                                component: 'StaticText',
                                attrs: {
                                    style: {
                                        width: '20px'
                                    }
                                },
                                value: '-',
                            },
                            {
                                component: 'DatePicker',
                                format: 'yyyy-MM-dd',
                                name: 'enddate',
                                ref: c => {
                                    enddateRef = c
                                },
                                span: '2',
                                placeholder: '结束日期',
                                onValueChange: (args) => {
                                    const today = utils.formatDate(new Date(), 'yyyy-MM-dd')
                                    if (enddateRef.currentValue == today) {
                                        DateDiff(startdateRef.currentValue, enddateRef.currentValue);
                                    }
                                    else {
                                        $('.yearbtn').removeClass('yearbtn')
                                    }
                                }
                            },
                            {
                                component: 'Field',
                                label: '',
                                labelWidth: 120,
                                control: {
                                    component: 'Cols',
                                    strechIndex: 1,
                                    items: [
                                        {
                                            component: 'Button',
                                            type: 'primary',
                                            text: '搜  索',
                                            attrs: {
                                                style: {
                                                    width: '70px',
                                                }
                                            },
                                            onClick: () => {
                                                seniorsearchClick();
                                            },
                                        },
                                        {
                                            component: 'Button',
                                            text: '重 置',
                                            attrs: {
                                                style: {
                                                    width: '70px',
                                                }
                                            },
                                            onClick: () => {
                                                groups.reset()
                                            },
                                        },
                                        {
                                            component: 'Button',
                                            text: '收起',
                                            icon: 'up',
                                            type: 'link',
                                            onClick: () => {
                                                groups.hide();
                                                simplegroups.show();
                                                //searchtype = 0;
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },

                    {
                        component: 'Cols',
                        attrs: {
                            style: {
                                background: '#f5f5f5',
                            }
                        },
                        items: [
                            {
                                children: {
                                    component: 'Select',
                                    allowClear: false,
                                    attrs: {
                                        style: {
                                            //cursor: 'pointer',
                                            marginLeft: '-0.5rem',
                                        }
                                    },
                                    ref: c => {
                                        selectRef = c
                                    },
                                    options: [
                                        {
                                            text: '研究中心视图',
                                            value: 0,
                                        },
                                        {
                                            text: '研究者视图',
                                            value: 1,
                                        },
                                        {
                                            text: '临床试验视图',
                                            value: 2,
                                        },
                                        {
                                            text: '申办方视图',
                                            value: 3,
                                        },
                                    ],
                                   
                                    onValueChange: function (e) {
                                        let func;
                                        if (searchtype == 0) {
                                            func = funcsimpleArray[e.sender.getValue()];
                                        }
                                        else {
                                            func = funcArray[e.sender.getValue()];
                                        }
                                        const pagerParams = pagerRef.getPageParams();
                                        issortref = true;
                                        fieldref = null;
                                        orderref = null;
                                        func({ pageIndex: 1, pageSize: pagerParams.pageSize });

                                        pagerRef.show();
                                        if (e.sender.getValue() == 0) {
                                            rowRef0.show();
                                            rowRef1.hide();
                                            tabRef2.hide();
                                            rowRef3.hide();
                                        }
                                        else if (e.sender.getValue() == 1) {
                                            rowRef1.show();
                                            rowRef0.hide();
                                            tabRef2.hide();
                                            rowRef3.hide();
                                        }
                                        else if (e.sender.getValue() == 2) {
                                            tabRef2.show();
                                            rowRef0.hide();
                                            rowRef1.hide();
                                            rowRef3.hide();
                                            if (selectedtab == 'tab1') {
                                                pagerRef.hide();
                                            }
                                            GetChart();
                                        }
                                        else {
                                            rowRef3.show();
                                            rowRef1.hide();
                                            tabRef2.hide();
                                            rowRef0.hide();
                                        }
                                    }
                                }
                            },
                            {
                                ref: c => {
                                    totalRef = c
                                },
                                component: 'StaticText',
                            }],
                    },

                    {
                        component: 'Rows',
                        ref: c => {
                            rowRef0 = c
                        },
                        attrs: {
                            style: {
                                paddingLeft: "10px",
                            }
                        },

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
                                    items: [{
                                        children: {
                                            component: 'Button',
                                            text: '智能排序',
                                            tooltip: '根据试验量值排序',
                                            onClick: () => {
                                                const pagerParams = pagerRef.getPageParams();
                                                //issortref表示是否启用智能排序：为true启用；
                                                issortref = true;
                                                orderref = "desc";
                                                fieldref = "CombinedScore";
                                                if (searchtype == 0) {
                                                    funcsimpleArray[0]({ ...pagerParams });
                                                }
                                                else {
                                                    funcArray[0]({ ...pagerParams });
                                                }

                                            },
                                        }
                                    },
                                    {
                                        component: 'Icon',
                                        type: 'info-circle',
                                        attrs: {
                                            title: '智能排序根据试验量值由大到小推荐，试验量值为汇集近几年的药物临床试验实施体量，同步考量其中研发的价值指标项与权重。具体评价指标包括：1、近一年新承接项目数 2、近3年承接项目总数 3、近3年承接国际多中心项目总数 4、近3年牵头国际多中心（中国区）项目数 5、近3年承接Ⅱ-Ⅲ药物项目总数 6、近3年I期临床试验项目数量 7、近3年牵头（国内多中心）试验数 8、近3年完成试验数。',

                                            style: {
                                                'font-size': '18px',
                                                cursor: 'pointer',
                                                'margin-right': '10px',
                                            },
                                        },
                                    },
                                    {
                                        children: {
                                            component: 'Button',
                                            ref: c => {
                                                exportbtnRef = c
                                            },
                                            text: '导出',
                                            tooltip: '导出Excel',
                                            onClick: () => {
                                                if (searchtype == 0) {
                                                    handleSimpleExport0({ ... { PageIndex: 1, PageSize: 999999 } });
                                                }
                                                else {
                                                    handleExport0({ ... { PageIndex: 1, PageSize: 999999 } });
                                                }

                                            },
                                        }
                                    }],
                                },

                            },
                            {
                                component: 'Grid',
                                ellipsis: 'both',
                                ref: c => {
                                    gridRef0 = c
                                },
                                onSort: ({ field, sortDirection }) => {
                                    const pagerParams = pagerRef.getPageParams();
                                    fieldref = field;
                                    orderref = sortDirection;
                                    issortref = false;
                                    if (searchtype == 0) {
                                        funcsimpleArray[0]({ ...pagerParams });
                                    }
                                    else {
                                        funcArray[0]({ ...pagerParams });
                                    }

                                },
                                columnsCustomizable: true,
                                columnResizable: true,
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
                                        title: '科室',
                                        field: 'deptname',
                                        cellRender: (args) => {
                                            return {
                                                tag: 'a',
                                                classes: {
                                                    vistedlink: true
                                                },
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
                                        title: '研究者',
                                        field: 'researchName',
                                        cellRender: (args) => {
                                            return {
                                                tag: 'a',
                                                classes: {
                                                    vistedlink: true
                                                },
                                                attrs: {
                                                    target: '_blank',
                                                    title: args.rowData.researchName,
                                                    href: `#!research/resdetail?SiteId=${args.rowData.id}&PIId=${args.rowData.piId}`
                                                },
                                                children: args.rowData.researchName
                                            }
                                        }
                                    },

                                    {
                                        title: '区域',
                                        field: 'provinceName',
                                        sortable: true,
                                        //sortable: (a, b) => (parseInt(a.provinceName) - parseInt(b.provinceName)),
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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simplecdeproj-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-cdeproj-list`, args);
                                                        }

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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simpleprojecting-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-projecting-list`, args);
                                                        }


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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simpleteamleader-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-teamleader-list`, args);
                                                        }


                                                    },
                                                },
                                            }
                                        }
                                    },
                                    {
                                        title: '操作',
                                        field: 'id',
                                        cellRender: (args) => {
                                            let texts = '';
                                            if (args.rowData.isActive == true && args.rowData.isSite == true && args.rowData.isSBFCreateProject == "True") {
                                                texts = '项目申请';
                                            }
                                            return {
                                                component: 'Button',
                                                text: texts,
                                                type: 'link',
                                                onClick: () => {
                                                    let href = '';
                                                    if (args.rowData.platformProjectCount == -1) {
                                                        //未登录跳到登录页面：
                                                        href = '/Account/Login/#institutiondb';
                                                        localStorage.setItem("lasturl", window.location.href);
                                                    }
                                                    else if (args.rowData.platformProjectCount == 0) {
                                                        href = `/Member/Project/GuidePage?oid=${args.rowData.id}&isScienceLogin=0`;
                                                    }
                                                    else {
                                                        href = `/Member/Project/Index?oid=${args.rowData.id}&isScienceLogin=0`;
                                                    }
                                                    window.open(href);
                                                }
                                            }
                                        }
                                    }
                                ],
                            },
                        ],

                    },

                    {
                        component: 'Rows',
                        ref: c => {
                            rowRef1 = c
                        },
                        attrs: {
                            style: {
                                paddingLeft: "10px",
                            }
                        },

                        items: [
                            {
                                component: 'Grid',
                                ellipsis: 'both',
                                columnResizable: true,
                                ref: c => {
                                    gridRef1 = c
                                },
                                onSort: ({ field, sortDirection }) => {
                                    const pagerParams = pagerRef.getPageParams();
                                    fieldref = field;
                                    orderref = sortDirection;
                                    issortref = false;
                                    if (searchtype == 0) {
                                        funcsimpleArray[1]({ ...pagerParams });
                                    }
                                    else {
                                        funcArray[1]({ ...pagerParams });
                                    }

                                },
                                columnsCustomizable: true,
                                columns: [
                                    {
                                        title: '姓名',
                                        field: 'name',
                                        cellRender: (args) => {
                                            return {
                                                tag: 'a',
                                                classes: {
                                                    vistedlink: true
                                                },
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
                                                classes: {
                                                    vistedlink: true
                                                },
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
                                                classes: {
                                                    vistedlink: true
                                                },
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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simplecdeproj-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-cdeproj-list`, args);
                                                        }
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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simpleprojecting-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-projecting-list`, args);
                                                        }
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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simpleteamleader-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-teamleader-list`, args);
                                                        }
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

                                    },
                                    {
                                        title: '邮箱',
                                        field: 'email',
                                        cellRender: (args) => {
                                            return `非公开`
                                        }

                                    },

                                ]
                            },
                        ],

                    },


                    {
                        component: 'Tabs',
                        ref: c => {
                            tabRef2 = c
                        },
                        onTabSelectionChange: () => {
                            selectedtab = tabRef2.getSelectedTab().key;
                            if (selectedtab == 'tab1') {
                                pagerRef.hide();
                            }
                            else {
                                pagerRef.show();
                            }
                        },
                        tabs: [
                            {
                                item: { text: '试验信息' },
                                panel: {
                                    children: [{
                                        component: 'Rows',
                                        attrs: {
                                            style: {
                                                paddingLeft: "10px",
                                            }
                                        },

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
                                                    items: [{
                                                        children: {
                                                            component: 'Button',
                                                            text: '导出',
                                                            tooltip: '导出Excel',
                                                            onClick: () => {
                                                                if (searchtype == 0) {
                                                                    handleSimpleExport2({ ... { PageIndex: 1, PageSize: 999999 } });
                                                                }
                                                                else {
                                                                    handleExport2({ ... { PageIndex: 1, PageSize: 999999 } });
                                                                }

                                                            }
                                                        }

                                                    }],
                                                }
                                            },
                                            {
                                                component: 'Grid',
                                                ellipsis: 'both',
                                                ref: c => {
                                                    gridRef2 = c
                                                },
                                                onFilter: (data) => {
                                                    if (searchtype == 0) {

                                                        funcsimpleArray[2]({ ... { PageIndex: 1, PageSize: 10 } });
                                                    }
                                                    else {

                                                        funcArray[2]({ ... { PageIndex: 1, PageSize: 10 } });
                                                    }

                                                },
                                                columnsCustomizable: true,
                                                columnResizable: true,
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
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=center',
                                                                },
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
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&f=center',
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
                                                        title: '适应症',

                                                    },
                                                    {
                                                        field: 'leadername',
                                                        title: '牵头研究者',
                                                        cellRender: (args) => {
                                                            if (args.rowData.leadername != null && args.rowData.id != null && args.rowData.piId != null) {
                                                                let leadernameArry = args.rowData.leadername.split(",");
                                                                let siteArry = args.rowData.id.split(",");
                                                                let piArry = args.rowData.piId.split(",");
                                                                if (leadernameArry.length > 1 && siteArry.length > 1 && piArry.length > 1) {
                                                                    return {
                                                                        component: 'Select',
                                                                        allowClear: false,
                                                                        ref: c => {
                                                                            leadernameRef = c
                                                                        },
                                                                        value: 0,
                                                                        options: leadernameArry.map((item, index) => (
                                                                            {
                                                                                text: item, value: index,
                                                                            })),

                                                                        onValueChange: function (e) {
                                                                            window.open(`#!research/resdetail?SiteId=${siteArry[e.newValue]}&PIId=${piArry[e.newValue]}`);
                                                                        }

                                                                    }
                                                                }

                                                                else {
                                                                    return {
                                                                        tag: 'a',
                                                                        classes: {
                                                                            vistedlink: true
                                                                        },
                                                                        attrs: {
                                                                            target: '_blank',
                                                                            title: args.rowData.leadername,
                                                                            href: `#!research/resdetail?SiteId=${args.rowData.id}&PIId=${args.rowData.piId}`
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

                                                    },
                                                    {
                                                        field: 'leaderorgname',
                                                        title: '牵头单位',

                                                        cellRender: (args) => {
                                                            if (args.rowData.leaderorgname != null && args.rowData.id != null) {
                                                                let leaderorgnameArry = args.rowData.leaderorgname.split(",");
                                                                let siteArry = args.rowData.id.split(",");

                                                                if (leaderorgnameArry.length > 1 && siteArry.length > 1) {
                                                                    return {
                                                                        component: 'Select',
                                                                        allowClear: false,
                                                                        value: 0,
                                                                        options: leaderorgnameArry.map((item, index) => (
                                                                            {
                                                                                text: item, value: index,
                                                                            })),

                                                                        onValueChange: function (e) {
                                                                            window.open(`#!research/organizedetail?SiteId=${siteArry[e.newValue]}&v=${new Date().getTime()}`);
                                                                        }

                                                                    }
                                                                }

                                                                else {
                                                                    return {
                                                                        tag: 'a',
                                                                        classes: {
                                                                            vistedlink: true
                                                                        },
                                                                        attrs: {
                                                                            target: '_blank',
                                                                            title: args.rowData.leaderorgname,
                                                                            href: `#!research/organizedetail?SiteId=${args.rowData.id}&v=${new Date().getTime()}`
                                                                        },
                                                                        children: args.rowData.leaderorgname,
                                                                    }
                                                                }

                                                            }

                                                        }
                                                    },
                                                    {
                                                        field: 'studyPhase2',
                                                        title: '试验分期',
                                                        filter: () => {
                                                            return {
                                                                component: 'CheckboxList',
                                                                cols: 1,
                                                                options: [
                                                                    { text: 'I期', value: 'I期' },
                                                                    { text: 'II期', value: 'II期' },
                                                                    { text: 'III期', value: 'III期' },
                                                                    { text: 'IV期', value: 'IV期' },
                                                                    { text: '其他', value: '其它' },
                                                                ],
                                                            }
                                                        },
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
                                        ],

                                    }]
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
                                                                            position: 'middle',
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
                    },
                    {
                        component: 'Rows',
                        ref: c => {
                            rowRef3 = c
                        },
                        attrs: {
                            style: {
                                paddingLeft: "10px",
                            }
                        },

                        items: [
                            {
                                component: 'Grid',
                                ref: c => {
                                    gridRef3 = c
                                },
                                onSort: ({ field, sortDirection }) => {
                                    const pagerParams = pagerRef.getPageParams();
                                    fieldref = field;
                                    orderref = sortDirection;
                                    issortref = false;
                                    if (searchtype == 0) {
                                        funcsimpleArray[3]({ ...pagerParams });
                                    }
                                    else {
                                        funcArray[3]({ ...pagerParams });
                                    }

                                },
                                ellipsis: 'both',
                                columnsCustomizable: true,
                                columnResizable: true,
                                columns: [
                                    {
                                        title: '申办方名称',
                                        field: 'name',
                                        cellRender: (args) => {
                                            return {
                                                tag: 'a',
                                                attrs: {
                                                    target: '_blank',
                                                    href: `#!research/sponsordetail?SponsorId=${args.rowData.id}`
                                                },
                                                children: args.rowData.name
                                            }
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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simplecdeproj-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-cdeproj-list`, args);
                                                        }

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
                                                        if (searchtype == 0) {
                                                            showModal(`/api/institutiondb/center/by-org/get-simpleprojecting-list`, args);
                                                        }
                                                        else {
                                                            showModal(`/api/institutiondb/center/by-org/get-projecting-list`, args);
                                                        }


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
                        ],

                    },

                    {
                        component: 'Pager',
                        ref: (c) => (pagerRef = c),
                        onPageChange: function (e) {
                            const pagerParams = pagerRef.getPageParams();
                            let index = selectRef.getValue();
                            let func;
                            if (searchtype == 0) {
                                func = funcsimpleArray[index];
                            }
                            else {
                                func = funcArray[index];
                            }

                            func(pagerParams);
                        }
                    },
                    {
                        component: 'Flex',
                        rows: [{
                            ref: (c) => (spideruptimeRef = c),

                        },
                        {
                            children: '说明：展示数据来自第三方信息公示平台（国家药品监督管理局、国家药品监督管理局药品审评中心、药物和医疗器械临床试验机构备案管理信息系统、药物临床试验登记与信息公示平台等）、机构老师、Wetrial运营团队以及用户提供。'
                        }],
                        attrs: {
                            style: {
                                padding: '20px 20px 20px 0',
                                'line-height': 1.8,
                                background: 'whitesmoke'
                            }
                        }
                    }
                ],
                onRendered: () => {
                    groups.hide();
                    simplegroups.show();
                    if (selectview == "2") {
                        selectRef.setValue(2);
                        rowRef1.hide();
                        rowRef0.hide();
                        rowRef3.hide();
                    }
                    else {
                        selectRef.setValue(0);
                        rowRef1.hide();
                        tabRef2.hide();
                        rowRef3.hide();
                    }

                    if (searchtext != undefined && searchtext != "") {
                        searchtextRef.setValue(searchtext);
                    }
                    simplegroupsearch = simplegroups.getValue();
                    searchtype = 0;
                    //获取机构爬虫更新时间：
                    SpiderUpdatedTime();
                }
            }
        }
    }
});

