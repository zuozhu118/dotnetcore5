define(["homepage-footer"], function (HomepageFooter) {
    return function () {
        let topMenu = null;
        let username = "";
        let avasrc = "";
        let RecruitmentLinkUrl = '';
        let usercommunity = '';
        //if (RecruitmentLinkUrl == null) {
        //    RecruitmentLinkUrl = '/Account/Login/#institutiondb';
        //    localStorage.setItem("lasturl", window.location.href); 
        //}
        const user = nomapp.context.User;
        
        if (user != null) {
            username = user.DisplayName;
            avasrc = `/My/Account/Avatar/${nomapp.context.User.Id}_s`;
            RecruitmentLinkUrl = nomapp.context.RecruitmentLinkUrl;
            usercommunity = '/Helps/Index';
        }
        else {
            usercommunity = '/Account/Login/#helps';
            RecruitmentLinkUrl = '/Account/Login/#recruit';
        }
        let logRef, resRef, avaRef, nameRef, canRef;
        const highLight = () => {
            const subPath = this.getSubpath();
            topMenu.selectItem(subPath);
            topMenu.expandToItem(subPath);
        };



        const data = {
            width: 1200,
            footer: [
                {
                    tag: 'span',
                    children: 'Copyright © 2015-2022 北京赛德盛医药科技股份有限公司版权所有',
                },
                {
                    tag: 'a',
                    attrs: {
                        href: 'https://beian.miit.gov.cn/',
                        target: '_blank',
                        style: {
                            color: '#888',
                        },
                    },
                    children: '京ICP备11034462号-2',
                },
                {
                    tag: 'span',
                    children: '| 京公网安备11010502038388',
                },
            ],
            items: [
                {
                    title: '联系我们',
                    type: 'list',
                    menu: [
                        {
                            text: 'shanshan.you@wetrial.com',
                            icon: null,
                            tag: '[业务咨询]',
                        },
                        {
                            text: 'shanshan.you@wetrial.com',
                            icon: null,
                            tag: '[媒体合作]',
                        },
                        {
                            text: '400-622-4688',
                            icon: null,
                            tag: '[技术支持]',
                        },
                    ],
                },
                {
                    title: '公司地址',
                    type: 'list',
                    menu: [
                        {
                            text: '长沙市岳麓区岳麓大道311号金麓国际商务广场5栋6层',
                            icon: null,
                            tag: '[长沙]',
                        },
                        {
                            text: '北京市朝阳区东十里堡路1号楼未来时501,509室',
                            icon: null,
                            tag: '[北京]',
                        },
                        {
                            text: '成都市洗面桥街22号城市阳光大厦2008室',
                            icon: null,
                            tag: '[成都]',
                        },
                        {
                            text: '石鼓路33号新街口东方名苑A座2302室',
                            icon: null,
                            tag: '[南京]',
                        },
                    ],
                },
                {
                    title: '业务咨询合作',
                    type: 'custom',
                    content: {
                        tag: 'img',
                        attrs: {
                            src: 'https://www.wetrial.com/Assets/img/zxhz.png',
                            style: {
                                width: '120px',
                                height: '120px',
                            },
                        },
                    },
                },
                {
                    title: '微试云公众号',
                    type: 'custom',
                    content: {
                        tag: 'img',
                        attrs: {
                            src: 'https://www.wetrial.com/Assets/img/wtcqr.png',
                            style: {
                                width: '120px',
                                height: '120px',
                            },
                        },
                    },
                },
            ],
            links: [
                {
                    text: "国家药品监督管理局",
                    url: "https://www.nmpa.gov.cn/",
                },
                {
                    text: "国家药品监督管理局药品审评中心",
                    url: "http://www.cde.org.cn/",
                },
                {
                    text: "药物和医疗器械临床试验机构备案管理信息系统",
                    url: "https://beian.cfdi.org.cn/CTMDS/apps/pub/public.jsp",
                },
                {
                    text: "药物临床试验登记与信息公示平台",
                    url: "http://www.chinadrugtrials.org.cn/",
                },
                {
                    text: "医生执业注册信息查询",
                    url: "http://zgcx.nhc.gov.cn:9090/Doctor",
                },
                {
                    text: "ClinicalTrials",
                    url: "https://clinicaltrials.gov/",
                },
                {
                    text: "快递100",
                    url: "https://poll.kuaidi100.com",
                },
            ],
        };

        return {
            view: {
                component: "Layout",
                fit:false,
                scroll: null,
                attrs: {
                    id: "MainLayout",
                },
                header: {
                    children: {
                        component: "Container",
                        breakpoint: "lg",
                        styles: {
                            height: "full",
                        },
                        children: {
                            component: "Navbar",
                            styles: {
                                margin: "x-auto",
                            },
                            caption: {
                                image: {
                                    attrs: {
                                        src: "/webapp/imgs/wtlgw.png",
                                        style: {
                                            height: "40px",
                                        },
                                    },
                                },
                                href: "/",
                                attrs: {
                                    style: {
                                        color: 'white',
                                        background: '#08c',
                                        border: 'none',
                                        fontSize:'12px',
                                    }
                                }
                            },
                            captionAfter: [{
                                component: 'Tag',
                                text: '机构数据库',
                                attrs: {
                                    style: {
                                        color: 'white',
                                        background: '#08c',
                                        border: 'none',
                                        fontSize: '16px',
                                        cursor: 'text',
                                        left: '-40px',
                                        position:'relative',
                                    }
                                }
                            }],
                            nav: {
                                component: "Menu",
                                ref: (c) => {
                                    topMenu = c;
                                },
                                direction: "horizontal",
                                itemDefaults: {
                                    styles: {
                                        rounded: "lg",
                                        hover: {
                                            color: "lighten",
                                        },
                                        selected: {
                                            color: "lighten",
                                        },
                                    },
                                },
                                items: [
                                    { text: "首页", key: "dashboard", url: "#!dashboard" },
                                    { text: "找中心", key: "research/center", url: "#!research/center" },
                                    {
                                        text: "微招募", key: `${RecruitmentLinkUrl}`, url: `${RecruitmentLinkUrl}`,
                                        attrs: {
                                            target: "_blank"
                                        }
                                    },
                                    {
                                        text: "用户社区", key: "", url: `${usercommunity}`, attrs: {
                                            target: "_blank"
                                        }
                                    }
                                ],
                            },

                            tools: {
                                itemDefaults: {
                                    styles: {
                                        hover: {
                                            color: "lighten",
                                        },
                                    },
                                },


                                items: [
                                    {
                                        component: "Button",
                                        text: "登录",
                                        ref: (c) => (logRef = c),
                                        styles: {
                                            color: "transparent",
                                            border: "none",
                                        },
                                        onClick: () => {
                                            location.href = '/Account/Login/#institutiondb';
                                            localStorage.setItem("lasturl", window.location.href); 
                                        },
                                        _rendered: function () {
                                            if (user != null) {
                                                logRef.hide();
                                            }
                                        }
                                    },
                                    {
                                        component: "Button",
                                        text: "注册",
                                        ref: (c) => (resRef = c),
                                        styles: {
                                            color: "transparent",
                                            border: "none",
                                        },
                                        onClick: () => {
                                            location.href =  '/Account/Register/#institutiondb';
                                        },
                                        _rendered: function () {
                                            if (user != null) {
                                                resRef.hide();
                                            }
                                        }
                                    },
                                    {
                                        tag: "img",
                                        ref: (c) => (avaRef = c),
                                        onClick: () => {
                                            location.href = "#!research/personcenter";
                                        },
                                        attrs: {
                                            src: avasrc,
                                            style: {
                                                width: "36px",
                                                height: "36px",
                                                cursor:'pointer',
                                            }
                                        },
                                        styles: {
                                            shape: "circle",
                                        },
                                        _rendered: function () {
                                            if (user == null) {
                                                avaRef.hide();
                                            }
                                        }
                                    },
                                    {
                                        component: "Button",
                                        text: username,
                                        ref: (c) => (nameRef = c),
                                        styles: {
                                            color: "transparent",
                                            border: "none",
                                        },
                                        key:'personCenter',
                                        onClick: () => {
                                            location.href = "#!research/personcenter";
                                        },
                                        _rendered: function () {
                                            if (user == null) {
                                                nameRef.hide();
                                            }
                                        },
                                        attrs:{id:'personCenter'}
                                    },
                                    
                                    {
                                        component: "Button",
                                        type: "link",
                                        icon: "power",
                                        styles: {
                                            color: "transparent",
                                        },
                                        ref: (c) => (canRef = c),
                                        popup: {
                                            //triggerAction: "click",
                                            children: {
                                                component: "Menu",
                                                items: [
                                                    {
                                                        text: "退出系统",
                                                        url: "/Common/Auth/MyLogout/?institutiondb=1",
                                                    },
                                                ],
                                            },
                                        },
                                        onClick: function () {
                                            localStorage.removeItem("url_beforlogin");
                                        },
                                        _rendered: function () {
                                            if (user == null) {
                                                canRef.hide();
                                            }
                                        }
                                    },
                                ],
                            },
                        },
                    },
                },
                body: {
                    children: {
                        component: "Container",
                        breakpoint: "lg",
                        children: {
                            component: "Router",
                            defaultPath: "dashboard",
                        },
                    },
                },
                footer: {
                    children: {
                        component: HomepageFooter,
                        data: data,
                    }
                }
            },
            _rendered: function () {
                highLight();
            },
            onSubpathChange: function () {
                highLight();
            },
        };
    };
});
