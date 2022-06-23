define(["wetrial-chart", "utils"], function (WetrialChart, utils) {

    let gridRef, chartref,
        columyearRef, lineyearRef,
        colummonthRef, linemonthRef,
        pagerRef, tabRef, breadRef,
        personRef, teststatusRef,
        drugRef, teststageRef, classifyRef,
        firsttextareaRef, firstpublishRef, comitemRef, comlisthideRef, strreplyRef, sumcomment = 0;

    const data = [];
    const yeardata = [];
    const monthdata = [];
    let chartcount = 0;
    let resultcount = 0;
    let orgname = '';
    let researcher = '';
    return function () {
        const query = this.$route.query;
        const user = nomapp.context.User;
        const asyncSearchCenterProject = function (params) {
            const searchParams = { ...params, ...query }
            axios.get(`/api/institutiondb/center/by-org/get-clinical-detail`, { params: searchParams, loading: true })
                .then(response => {
                    const { currentPage, totalItems, items } = response;
                    gridRef.update({ data: items })
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

        const asyncHeadDetail = function () {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-PI-detail`, { params: searchParams, loading: true })
                .then(response => {
                    if (response.items.length > 0) {

                        const { name, email, studySiteName, recordDetail, position, telephone, deptname, deptId } = response.items[0];
                        let tel = '';
                        let ema = "";
                        if (telephone != null) {
                            tel = telephone;
                        }
                        if (email != null) {
                            ema = email;
                        }

                        let titles = studySiteName + "-机构数据库-WeTrial";
                        orgname = studySiteName;
                        researcher = name;

                        document.title = titles;
                        personRef.update({
                            items: [{
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            tag: "span",
                                            attrs: {
                                                style: {
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                }
                                            },
                                            children: name,
                                        },

                                        (position !== "" && position !== null) && {
                                            component: 'Tag',
                                            text: position,
                                            color: 'yellow',
                                            size: 'xs',
                                        }
                                        ,
                                        (recordDetail !== "" && recordDetail !== null) && {
                                            component: 'Tag',
                                            text: recordDetail,
                                            color: 'olive',
                                            size: 'xs',
                                        }
                                    ]
                                }
                            }, {
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            tag: "span",
                                            children: studySiteName,
                                        },
                                        {
                                            tag: "span",
                                            children: deptname,
                                        }

                                    ]
                                }
                            }, {
                                tag: 'span',
                                children: {
                                    component: 'Cols',
                                    items: [
                                        {
                                            tag: "span",
                                            children: "电话：非公开",
                                            //children: "电话：" + tel,
                                        },
                                        {
                                            tag: "span",
                                            children: "邮箱：非公开",
                                            //children: "邮箱：" + ema,
                                        }

                                    ]
                                }
                            }]
                        })

                        //面包屑导航：
                        if (deptname == null) {
                            breadRef.update({
                                items: [{
                                    text: '找中心',
                                    url: '#!research/center'
                                },
                                {
                                    text: studySiteName,
                                    url: `#!research/organizedetail?SiteId=${searchParams.SiteId}&v=${new Date().getTime()}`
                                },
                                {
                                    text: name,
                                }]
                            });
                        }
                        else {
                            breadRef.update({
                                items: [{
                                    text: '找中心',
                                    url: '#!research/center'
                                },
                                {
                                    text: studySiteName,
                                    url: `#!research/organizedetail?SiteId=${searchParams.SiteId}&v=${new Date().getTime()}`
                                },
                                {
                                    text: deptname,
                                    url: `#!research/departdetail/?SiteId=${searchParams.SiteId}&deptId=${deptId}`
                                },
                                {
                                    text: name,
                                }]
                            });
                        }

                                                //处理第一个发布评论头像：
                        if (user != null) {
                            firstpublishRef.update({ attrs: { src: `/My/Account/Avatar/${nomapp.context.User.Id}_s` } });
                        }
                    }
                })
        }

        const asyncTestStatusChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststatus-chart`, { params: searchParams, loading: true })
                .then(response => {
                    resultcount += 1;
                    teststatusRef.changeData(response)

                })
        }

        const asyncTestStageChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-teststage-chart`, { params: searchParams, loading: true })
                .then(response => {
                    resultcount += 1;
                    teststageRef.changeData(response)
                })
        }

        const asyncDrugChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-drug-chart`, { params: searchParams, loading: true })
                .then(response => {
                    resultcount += 1;
                    drugRef.changeData(response)
                })
        }

        const asyncClassifyChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-classify-chart`, { params: searchParams, loading: true })
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

        const asyncYearChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-year-chart`, { params: searchParams, loading: true })
                .then(response => {
                    resultcount += 1;
                    addstudyphaseYear(response);
                    columyearRef.changeData(yeardata)
                    lineyearRef.changeData(yeardata)


                })
        }

        const asyncMonthChart = () => {
            const searchParams = { ...query }
            axios.get(`/api/institutiondb/center/by-org/get-month-chart`, { params: searchParams, loading: true })
                .then(response => {
                    resultcount += 1;
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
                url: `/api/institutiondb/center/by-org/export-res-clinical`,
                data: searchParams,
                ext: ".xlsx",
                name: "临研试验_" + curtime,
            });
        };

        //添加关注
        const addAttention_user = function (callback) {
            let enty = new Src_UserAttention();
            enty.UserId = user.Id;
            enty.TenantId = query.PIId;
            enty.TenantType = 2;
            axios.post('/api/institution-db/org-attentions/user-add-attention', enty)
                .then((res) => {
                    callback(res);
                });
        }
        //取消关注研究员
        let cancelAttention_user = (id, callback) => {
            axios.get('/api/institution-db/org-attentions/user-cancel-attention?id=' + id)
                .then((res) => {
                    callback(res);
                });
        }
        //获取是否关注
        const getUserAttention = function () {
            if (!user || !query) return;
            axios.get('/api/institution-db/org-attentions/get-useratten-byuser?userId=' + user.Id + '&piId=' + query.PIId)
                .then((res) => {
                    if (res && res.status == 1) {
                        btnAtten.update({ text: '已关注', icon: 'love-blue', isAtten: true, attenId: res.id });
                    } else {
                        btnAtten.update({ text: '关注', icon: 'love-nomal', isAtten: false, attenId: res && res.id });
                    }
                });
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
                //updatetimeRef.update({ children: `更新时间：${strdate}` });
            }
            else {
                if (difhours >= 1) {
                    return `${difhours}小时前`;
                    //updatetimeRef.update({ children: `更新时间：${difhours}小时前` });
                }
                else {
                    if (difmins >= 1) {
                        return `${difmins}分钟前`;
                        //updatetimeRef.update({ children: `更新时间：${difmins}分钟前` });
                    }
                    else {
                        return '刚刚';
                        //updatetimeRef.update({ children: `更新时间：刚刚` });
                    }
                }
            }
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
                            //args.currentTarget.component.children[2].children[0].children[0].children[0].show();
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
            axios.get(`/api/institutiondb/center/by-org/get-comment-list`, { params: searchParams, loading: true })
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
            let TenantId = query.PIId;
            let Type = 3;
            if (Comment == null || Comment.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') == '') {
                return;
            }
            axios.post(`/api/institutiondb/center/by-org/publish-comment`, { Comment, TenantId, Type}).then((ret) => {
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
            let TenantId = query.PIId;
            let Type = 3;
            axios.post(`/api/institutiondb/center/by-org/publish-comment`, { id, Comment, TenantId, Type }).then((ret) => {
                asyncCommentlist();
            })
        }

        return {
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
                                _created() {
                                    asyncHeadDetail()
                                },
                            },
                            {
                                component: 'Cols',
                                attrs: {
                                    style: { padding: '20px 5px' }
                                },
                                items: [
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
                                                    userId: user == null ? "" : user.Id,
                                                    orgname: orgname,
                                                    researcher: researcher,
                                                    piId: query.PIId,
                                                },
                                                content: '/webapp/institutiondb/personalCenter/orgQRshare.js',
                                            });
                                        },
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
                                                localStorage.setItem("url_beforlogin", "#!research/resdetail/?SiteId=" + query.SiteId + '&PIId=' + query.PIId);
                                                location.href = '/Account/Login/#institutiondb_redirectlast';
                                            };
                                            if (!query || !query.PIId || !user.Id) {
                                                console.log("缺少参数！")
                                                return;
                                            }
                                            if (btnAtten.props.isAtten && btnAtten.props.attenId) {
                                                //取消关注
                                                cancelAttention_user(btnAtten.props.attenId, attenClick);
                                                new nomui.Message({
                                                    content: '取关成功',
                                                    type: 'success'
                                                });

                                            } else {
                                                //关注
                                                if (btnAtten.props.attenId) {
                                                    cancelAttention_user(btnAtten.props.attenId, attenClick);
                                                } else {
                                                    addAttention_user(attenClick);
                                                }
                                                new nomui.Message({
                                                    content: '关注成功',
                                                    type: 'success'
                                                });
                                            }

                                            function attenClick(res) {
                                                if (res) {
                                                    getUserAttention();
                                                }
                                            }
                                        },
                                        _created: function () {
                                            getUserAttention();
                                        },
                                    }
                                ]
                            },

                        ]
                    },

                    {
                        component: 'Tabs',
                        ref: c => {
                            tabRef = c
                        },
                        tabs: [
                            {
                                item: { text: '试验信息' },
                                panel: {
                                    children: [
                                        {
                                            component: 'Rows',
                                            items: [{
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
                                                component: 'Grid',
                                                ellipsis: 'both',
                                                ref: c => {
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
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&PIId=' + query.PIId,
                                                                },
                                                                children: args.rowData.registrationNo
                                                            }
                                                        }
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
                                                                    href: '#!details/experimentDetails?registrationNo=' + args.rowData.registrationNo + '&popularTitle=' + args.rowData.popularTitle + '&PIId=' + query.PIId,
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
                                                        ellipsis: true,
                                                    },
                                                    {
                                                        field: 'sponsorName',
                                                        title: '申办方',
                                                        ellipsis: true,
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
                                            }]
                                        }],
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
                                        onCreated: () => {
                                            asyncTestStageChart();//试验分期
                                            asyncClassifyChart();//试验分类
                                            asyncDrugChart();//药物分类
                                            asyncTestStatusChart();//试验状态
                                            asyncYearChart();//试验年趋势分析
                                            asyncMonthChart();//月
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

