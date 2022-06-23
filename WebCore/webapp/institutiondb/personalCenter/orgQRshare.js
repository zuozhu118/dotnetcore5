define(['../../libs/sds-common-extendjs/qrcode.min.js'], function () {
    let titleRef;

    // 保存按钮点击事件方法
    function saveImg() {
        const div = document.getElementById('divqrcode')
        var sampleImage = div.getElementsByTagName('img')[0];
        var canvas = convertImageToCanvas(sampleImage);
        url = canvas.toDataURL("image/png");
        const triggerDownload = document.getElementById('saveImg');
        triggerDownload.setAttribute('href', url);
        let name = '';

        if (orgname != undefined && researcher == undefined && deptname == undefined) {
            name = orgname + '.png';
        }
        else if (orgname != undefined && researcher == undefined && deptname != undefined) {
            name = orgname + '_' + deptname + '.png';
        }
        else if (orgname != undefined && researcher != undefined && deptname == undefined) {
            name = orgname + '_' + researcher + '.png';
        }
        triggerDownload.setAttribute('download', name);
        triggerDownload.click();
    }

    /**
    * 根据图片生成画布
    */
    function convertImageToCanvas(image) {
        var canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 600;
        canvas.getContext("2d").drawImage(image, 0, 0, 600, 600);
        return canvas;
    }
    let siteId = '';
    let userId = '';
    let piId = '';
    let deptId = '';
    let deptname = '';
    let orgname = '';
    let researcher = '';
    ///获取二维码图片
    let getQcImg = function (callback) {
        let searchParams = { siteId: siteId, userId: userId, piId: piId, deptId: deptId, deptname: deptname }
        axios.get(`/api/institutiondb/center/by-org/qrcode`, { params: searchParams, loading: true })
            .then(response => {
                let res = 'data:image/png;base64,' + response;
                callback(res);
            });
    }
    let updateData = function updateData(data) {
        divDom.update({
            children: {
                tag: 'img',
                attrs: {
                    src: data,
                },
            }
        });
        if (orgname != undefined && researcher == undefined && deptname != undefined) {
            titleRef.update({ value: '微信扫码查看该专业详情' });
        }
        else if (orgname != undefined && researcher != undefined && deptname == undefined) {
            titleRef.update({ value: '微信扫码查看该研究者详情' });
        }

    }


    return function (modal) {
        siteId = modal.props.data.siteId;
        userId = modal.props.data.userId;
        piId = modal.props.data.piId;
        deptId = modal.props.data.deptId;
        deptname = modal.props.data.deptname;
        orgname = modal.props.data.orgname;
        researcher = modal.props.data.researcher;
        return {
            header: {
                caption: { title: '分享' },
            },
            body: {
                children: [
                    {
                        tag: 'a',
                        attrs: {
                            style: 'display:none;',
                            id: 'saveImg'
                        }
                    },
                    {
                        component: 'StaticText',
                        ref: c => {
                            titleRef = c
                        },
                        value: '微信扫码查看该机构详情',
                        attrs: {
                            style: 'text-align:center;'
                        }
                    },
                    {
                        tag: 'div',
                        attrs: {
                            id: 'divqrcode',
                            style: {
                                width: '200px',
                                height: '200px',
                                colorDark: "#000000",
                                colorLight: "#ffffff",
                                margin: '0 auto',
                            }
                        },
                        ref: (c) => {
                            divDom = c;
                        },
                    },
                    {
                        component: 'Cols',
                        items:
                            [
                                {
                                    component: 'Button',
                                    text: '保存二维码',
                                    onClick: function () {
                                        saveImg();
                                    }
                                }
                            ],
                        justify: 'center',
                    }
                ],
            },
            onOk: () => {
                modal.close()
            },
            _rendered: function () {
                //console.log(document.getElementById('divqrcode'));
                //let qrcode = new QRCode(document.getElementById("divqrcode"), {
                //    text: modal.props.data.url,
                //    width: 128,
                //    height: 128,
                //    colorDark : "#000000",
                //    colorLight : "#ffffff",
                //    correctLevel : QRCode.CorrectLevel.H
                //});
                /*调用后台 获取二维码图片*/
                getQcImg(updateData);
            }
        };
    }
});