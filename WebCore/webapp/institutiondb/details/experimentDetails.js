define([], function () {
    let dataSet = {},/*结果集*/
        data = {}, /*临床试验项目*/
        dataSiteInfo = {}, /*研究中心*/
        dataSiteRawList = []; /*参与机构*/
    let title = '';
    let breadRef = '';

    return (args) => {
        document.title = args.route.query.popularTitle + '-机构数据库-WeTrial';
        let query = args.route.query;


        const asyncBread = function () {
            const searchParams = { ...query }
            if (searchParams.f=='index') {
                breadRef.update({
                    items: [{
                        text: '首页',
                        url: '#!dashboard'
                    },
                    {
                        text: args.route.query.popularTitle,
                    }]
                });
            }
            else if (searchParams.f == 'center') {
                breadRef.update({
                    items: [{
                        text: '找中心',
                        url: '#!research/center'
                    },
                    {
                        text: args.route.query.popularTitle,
                    }]
                });
            }
            else if (searchParams.f == 'search') {
                let searchsite = localStorage.getItem("centersearch");
                breadRef.update({
                    items: [{
                        text: '中心筛选',
                        url: searchsite
                    },
                    {
                        text: args.route.query.popularTitle,
                    }]
                });
            }
            else {
                axios.get(`/api/institutiondb/center/by-org/get-bread-crumb`, { params: searchParams })
                    .then(response => {
                        if (response.items.length > 0) {
                            let bread = response.items[0];
                            
                            if (searchParams.SiteId != undefined) {
                                breadRef.update({
                                    items: [{
                                        text: '找中心',
                                        url: '#!research/center'
                                    },
                                    {
                                        text: bread.studySiteName,
                                        url: `#!research/organizedetail?SiteId=${bread.id}&v=${new Date().getTime()}`
                                    },
                                    {
                                        text: args.route.query.popularTitle,
                                    }]
                                });
                            }
                            else if (searchParams.deptId != undefined) {
                                breadRef.update({
                                    items: [{
                                        text: '找中心',
                                        url: '#!research/center'
                                    },
                                    {
                                        text: bread.studySiteName,
                                        url: `#!research/organizedetail?SiteId=${bread.id}&v=${new Date().getTime()}`
                                    },
                                    {
                                        text: bread.deptname,
                                        url: `#!research/departdetail/?SiteId=${bread.id}&deptId=${bread.deptId}`
                                    },
                                    {
                                        text: args.route.query.popularTitle,
                                    }]
                                });
                            }
                            else if (searchParams.SponsorId != undefined) {
                                breadRef.update({
                                    items: [{
                                        text: '首页',
                                        url: '#!dashboard'
                                    },
                                    {
                                        text: bread.name,
                                        url: `#!research/sponsordetail?SponsorId=${bread.id}`
                                    },
                                    {
                                        text: args.route.query.popularTitle,
                                    }]
                                });
                            }
                            else if (searchParams.PIId != undefined) {
                                
                                if (bread.deptname == null || bread.deptname == undefined) {
                                    breadRef.update({
                                        items: [{
                                            text: '找中心',
                                            url: '#!research/center'
                                        },
                                        {
                                            text: bread.studySiteName,
                                            url: `#!research/organizedetail?SiteId=${bread.id}&v=${new Date().getTime()}`
                                        },
                                        {
                                            text: bread.name,
                                            url: `#!research/departdetail/?SiteId=${bread.id}&PIId=${bread.piId}`
                                        },
                                        {
                                            text: args.route.query.popularTitle,
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
                                            text: bread.studySiteName,
                                            url: `#!research/organizedetail?SiteId=${bread.id}&v=${new Date().getTime()}`
                                        },
                                        {
                                            text: bread.deptname,
                                            url: `#!research/departdetail/?SiteId=${bread.id}&deptId=${bread.deptId}`
                                        },
                                        {
                                            text: bread.name,
                                            url: `#!research/departdetail/?SiteId=${bread.id}&PIId=${bread.piId}`
                                        },
                                        {
                                            text: args.route.query.popularTitle,
                                        }]
                                    });
                                }
                            }
                        }

                    });
            }
            
        };

        return {
            view: {
                styles: {
                    color: 'white',
                },
                children:
                    [{
                        component: 'Breadcrumb',
                        ref: c => {
                            breadRef = c
                        }
                    },
                    {

                        component: 'Cols',
                        items: [
                            {
                                tag: 'h5',
                                ref: (c) => {
                                    title_h3 = c
                                },
                                children: args.route.query.popularTitle,
                                attrs: {
                                    style: 'padding:10px 10px;font-weight: 600;',
                                    class: 'sticky'
                                }
                            },
                            {
                                tag: 'h6',
                                ref: (c) => {
                                    title_h3_behind1 = c
                                },
                                children: '',
                                attrs: {
                                    style: 'color:rgb(127,127,127);'
                                }
                            },
                            {
                                tag: 'h6',
                                ref: (c) => {
                                    title_h3_behind2 = c
                                },
                                children: '',
                                attrs: {
                                    style: 'color:rgb(127,127,127);margin-left:5px;'
                                }
                            }
                        ]
                    },
                    {
                        component: 'Panel',
                        ref: (c) => {
                            tPanel = c;
                        },
                        header: {
                            caption: {
                                title: '基本资料'
                            }
                        },
                        body: {
                            children:
                                [
                                    {
                                        component: 'Cols',
                                        inline: true,
                                        align: 'start',
                                        items:
                                            [
                                                {
                                                    component: 'Rows',
                                                    items: [
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top1',
                                                            children: {
                                                                tag: 'div',
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '题目和背景信息',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]


                                                            },


                                                        },
                                                        {
                                                            component: 'Group',
                                                            key: 'group1',
                                                            ref: (c) => {
                                                                group1 = c;
                                                            },
                                                            fields: [
                                                                { component: 'StaticText', label: '登记号', name: 'registrationNo', ref: (c) => { st = c } },
                                                                { component: 'StaticText', label: '适应症', name: 'indication' },
                                                                { component: 'StaticText', label: '试验通俗题目', name: 'popularTitle' },
                                                                { component: 'StaticText', label: '试验专业题目', name: 'studyTitle' },
                                                                { component: 'StaticText', label: '试验方案编号', name: 'protocolNO' },
                                                                { component: 'StaticText', label: '药物名称', name: 'drugName' },
                                                                { component: 'StaticText', label: '药物类型', name: 'drugClassification' },
                                                                { component: 'StaticText', label: '试验状态', name: 'studyStatus' },
                                                                { component: 'StaticText', label: '首次公示信息日期', name: 'publishedDate' }
                                                            ],
                                                            value:
                                                            {
                                                                registrationNo: data && data.registrationNo,
                                                                indication: '',
                                                                popularTitle: '',
                                                                studyTitle: '',
                                                                protocolNO: '',
                                                                drugName: '',
                                                                drugClassification: '',
                                                                studyStatus: '',
                                                                publishedDate: '',
                                                            }

                                                        },
                                                        {

                                                            component: 'AnchorContent',
                                                            key: 'top2',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'申办者信息'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '申办者信息',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]
                                                            },

                                                        },
                                                        {
                                                            component: 'Group',
                                                            ref: (c) => {
                                                                group2 = c;
                                                            },
                                                            fields: [
                                                                { component: 'StaticText', label: '申办者名称', name: 'sponsorName', }
                                                            ],
                                                            value:
                                                            {
                                                                sponsorName: '',
                                                            }
                                                        },
                                                        {

                                                            component: 'AnchorContent',
                                                            key: 'top3',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'临床试验信息'
                                                                children:
                                                                    [
                                                                        {
                                                                            attrs: {
                                                                                style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                            }
                                                                        },
                                                                        {
                                                                            children: '临床试验信息',
                                                                            attrs: {
                                                                                style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                            }
                                                                        }
                                                                    ]
                                                            },

                                                        },
                                                        {
                                                            component: 'Group',
                                                            ref: (c) => {
                                                                group3 = c;
                                                            },
                                                            fields: [
                                                                { component: 'StaticText', label: '试验目的', name: 'studyAim' },
                                                                { component: 'StaticText', label: '试验分类', name: 'studyType' },
                                                                { component: 'StaticText', label: '试验分期', name: 'studyPhase' },
                                                                { component: 'StaticText', label: '试验范围', name: 'studyArea' },
                                                                { component: 'StaticText', label: '随机化', name: 'randomization' },
                                                                { component: 'StaticText', label: '盲法', name: 'blinding' },
                                                                { component: 'StaticText', label: '设计类型', name: 'designType' },
                                                            ],
                                                            value:
                                                            {
                                                                studyAim: '',
                                                                studyType: '',
                                                                studyPhase: '',
                                                                studyArea: '',
                                                                randomization: '',
                                                                blinding: '',
                                                                designType: '',
                                                            }
                                                        },
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top4',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'受试者信息'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '受试者信息',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]
                                                            },

                                                        },
                                                        {
                                                            component: 'Group',
                                                            ref: (c) => {
                                                                group4 = c;
                                                            },
                                                            fields: [
                                                                { component: 'StaticText', label: '年龄', name: 'subjectAge', },
                                                                { component: 'StaticText', label: '性别', name: 'subjectSex' },
                                                                { component: 'StaticText', label: '健康受试者', name: 'subjectType' },
                                                            ],
                                                            value:
                                                            {
                                                                subjectAge: '',
                                                                subjectSex: '',
                                                                subjectType: '',
                                                            }

                                                        },
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top5',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'入选标准'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '入选标准',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]
                                                            }

                                                        },
                                                        {
                                                            component: 'div',
                                                            ref: (c) => { admissionRuleDiv = c },
                                                            attrs: { style: 'margin-left: 10px;' },
                                                            children: []
                                                        },
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top6',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'排除标准'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '排除标准',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]
                                                            }

                                                        },
                                                        {
                                                            component: 'div',
                                                            ref: (c) => { unAdmissionRuleDiv = c },
                                                            attrs: { style: 'margin-left: 10px;' },
                                                            children: []
                                                        },
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top7',
                                                            children: {
                                                                tag: 'div',
                                                                // children:'主要研究者'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '主要研究者',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        {
                                                            component: 'Rows',
                                                            ref: (c) => { pisRow = c },
                                                            attrs: { style: 'margin-left: 5px;' },
                                                            items: []
                                                        },
                                                        {
                                                            component: 'AnchorContent',
                                                            key: 'top8',
                                                            children: {

                                                                tag: 'div',
                                                                // children:'参与机构'
                                                                children: [
                                                                    {
                                                                        attrs: {
                                                                            style: 'content: "";display: inline-block; background: rgb(66,99,236,1);margin-right:5px;width: 5px;border-radius: 4px;height: 11px;'
                                                                        }
                                                                    },
                                                                    {
                                                                        children: '参与机构',
                                                                        attrs: {
                                                                            style: 'font-size: 14px;color: #424F65;font-weight: 600;display: contents;'
                                                                        }
                                                                    }
                                                                ]

                                                            },
                                                        },
                                                        {
                                                            component: 'Rows',
                                                            ref: (c) => { siteRow = c },
                                                            attrs: { style: 'margin-left: 10px;' },
                                                            items: []
                                                        },
                                                        {
                                                            tag: 'div',
                                                            children: '',
                                                            ref: (c) => {
                                                                dDom = c;
                                                            },
                                                            _created: () => {
                                                                //let searchParams={registrationNo:args.route.query.registrationNo};
                                                                //DataCenterController  203 GetHospital    440  GetStudyProject  

                                                                let registrationNo = args.route.query.registrationNo;  //'CTR20170274'
                                                                let f = args.route.query.f;
                                                                axios.get(`/api/institution-db/details/get-experiment-detail?exprerimentNO=` + registrationNo)
                                                                    .then((res) => {
                                                                        dataSet = res;
                                                                        data = dataSet.studyProject || {};
                                                                        dataSiteInfo = dataSet.studySiteInfo || {};
                                                                        dataSiteRawList = dataSet.projectSiteRawDataList || [];
                                                                        // title = '研究中心'+ 
                                                                        // (dataSiteInfo.fI_Fullname==undefined?'':'/'+dataSiteInfo.fI_Fullname.replace(/^\s+|\s+$/g,"") ) 
                                                                        // + (dataSiteInfo.studySiteNo==undefined?'':'/'+dataSiteInfo.studySiteNo.replace(/^\s+|\s+$/g,""))
                                                                        // +'/'+  args.route.query.popularTitle;
                                                                        title = args.route.query.popularTitle;
                                                                        title_h3.update({ children: title });
                                                                        title_h3_behind1.update({ children: '公示日期：' + (data.publishedDate ? nomui.utils.formatDate(data.publishedDate, 'yyyy-MM-dd') : '-') });
                                                                        title_h3_behind2.update({ children: '来源：' + (data.sourceComment ? data.sourceComment : '-') });
                                                                        group1.setValue(
                                                                            {
                                                                                registrationNo: data.registrationNo,
                                                                                indication: data.indication,
                                                                                popularTitle: data.popularTitle,
                                                                                studyTitle: data.studyTitle,
                                                                                protocolNO: data.protocolNO,
                                                                                drugName: data.drugName,
                                                                                drugClassification: data.drugClassification,
                                                                                studyStatus: data.studyStatus,
                                                                                publishedDate: data.publishedDate || '暂无',
                                                                            }
                                                                        );
                                                                        group2.setValue({ sponsorName: data.sponsorName });
                                                                        group3.setValue(
                                                                            {
                                                                                studyAim: data.studyAim,
                                                                                studyType: data.studyType,
                                                                                studyPhase: data.studyPhase,
                                                                                studyArea: data.studyArea,
                                                                                randomization: data.randomization,
                                                                                blinding: data.blinding,
                                                                                designType: data.designType
                                                                            }
                                                                        );
                                                                        group4.setValue(
                                                                            {
                                                                                subjectAge: data.subjectAge,
                                                                                subjectSex: data.subjectSex,
                                                                                subjectType: data.subjectType == 0 ? '患者' : data.subjectType == 1 ? '健康受试者' : '无'
                                                                            }
                                                                        );
                                                                        let child_admission = [], un_child_admission = [], child_pis = [], child_site = [];
                                                                        let admisson_rules = res.subjectCriteriaList2 || [];  //入选
                                                                        let un_admisson_rules = res.subjectCriteriaList1 || []; //排除
                                                                        let pis = res.projectPIRawDataList || [];             //主要研究者
                                                                        for (let i = 0; i < admisson_rules.length; i++) {
                                                                            let objDom = {
                                                                                component: 'div',
                                                                                children: admisson_rules[i]['serialNum'] + ':' + admisson_rules[i]['criteriaText'],
                                                                                attrs: { style: 'font-size: 14px;padding:5px 0;color: #333333' }
                                                                            }
                                                                            child_admission.push(objDom);
                                                                        }
                                                                        for (let i = 0; i < un_admisson_rules.length; i++) {
                                                                            let objDom = {
                                                                                component: 'div',
                                                                                children: un_admisson_rules[i]['serialNum'] + ':' + un_admisson_rules[i]['criteriaText'],
                                                                                attrs: { style: 'font-size: 14px;padding:5px 0;color: #333333' }
                                                                            }
                                                                            un_child_admission.push(objDom);
                                                                        }
                                                                        for (let i = 0; i < pis.length; i++) {
                                                                            let objDom = {
                                                                                children: [
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '姓名', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['piName'] }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '学位', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['degrees'] }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '职称', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['position'] }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '电话', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                // {component:'StaticText',value:pis[i]['telePhone']}
                                                                                                { component: 'StaticText', value: '非公开' }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: 'Email', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                // {component:'StaticText',value:pis[i]['email']}
                                                                                                { component: 'StaticText', value: '非公开' }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '邮政地址', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['postAddress'] }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '邮编', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['postNo'] }
                                                                                            ]
                                                                                    },
                                                                                    {
                                                                                        component: 'Cols',
                                                                                        items:
                                                                                            [
                                                                                                { component: 'StaticText', value: '单位名称', attrs: { style: 'font-weight: 600;font-size: 14px;' } },
                                                                                                { component: 'StaticText', value: pis[i]['company'] }
                                                                                            ]
                                                                                    },
                                                                                ]
                                                                            }
                                                                            child_pis.push(objDom);
                                                                        }

                                                                        for (var item of dataSiteRawList) {
                                                                            let country = item['country'] == '中国' ? '' : (item['country'] == null || item['country'] == 'N/A' ? '' : item['country']) + '  ';
                                                                            country = country + '省份:' + (item['province'] == null || item['province'] == 'N/A' ? '-' : item['province'])
                                                                                + '  城市:' + (item['city'] == null || item['city'] == 'N/A' ? '-' : item['city']);
                                                                            let objDom = {
                                                                                children: [
                                                                                    { tag: 'h5', children: item['siteName'], attrs: { style: 'font-weight: 600;' } },
                                                                                    { component: 'div', children: item['pi'], attrs: { style: 'padding-top:3px;margin-left:3px;font-size: 1rem;' } },
                                                                                    { component: 'div', children: country, attrs: { style: 'padding-top:1px;margin-left:3px;font-size: 1rem;' } }
                                                                                ],
                                                                            }
                                                                            child_site.push(objDom);
                                                                        }

                                                                        //更新入选标准
                                                                        admissionRuleDiv.update({ children: child_admission });
                                                                        //更新排除标准
                                                                        unAdmissionRuleDiv.update({ children: un_child_admission });
                                                                        //更新主要研究者
                                                                        pisRow.update({ items: child_pis });
                                                                        //更新参与机构
                                                                        siteRow.update({ items: child_site });

                                                                        //面包屑导航：
                                                                        asyncBread();
                                                                    });
                                                            },
                                                        },
                                                    ]
                                                },
                                                {

                                                    component: 'Anchor',
                                                    sticky: true,
                                                    container: window,

                                                    attrs: {
                                                        style: ''
                                                    },
                                                    items: [
                                                        { text: '题目和背景信息', key: 'top1' },
                                                        { text: '申办者信息', key: 'top2' },
                                                        { text: '临床试验信息', key: 'top3' },
                                                        { text: '受试者信息', key: 'top4' },
                                                        { text: '入选标准', key: 'top5' },
                                                        { text: '排除标准', key: 'top6' },
                                                        { text: '主要研究者', key: 'top7' },
                                                        { text: '参与机构', key: 'top8' },
                                                    ],
                                                    _rendered: function () {

                                                    }

                                                }
                                            ]
                                    }

                                ]

                        }
                    }
                    ],

            },


        }






    }
});