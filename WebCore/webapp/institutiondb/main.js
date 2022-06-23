"use strict";

(function (win) {
  requirejs.onError = function (err) {
    console.log(err);
    console.log("modules: " + err.requireModules);
  };

  requirejs.config({
    // urlArgs: (moduleName, url) => {
    //   if (
    //     window.abp &&
    //     window.abp.wetrialStaticFileMap &&
    //     window.abp.wetrialStaticFileMap[url]
    //   ) {
    //     return `${url.indexOf("?") === -1 ? "?" : "&"}_v=${
    //       window.abp.wetrialStaticFileMap[url]
    //     }`;
    //   }
    //   return "";
    // },
    map: {
      "*": {
        css: "/webapp/libs/require-css.min.js",
      },
    },
    baseUrl: "/",
    waitSeconds:20,
    paths: {
      "wetrial-basic": "webapp/common/wetrial-basic", // wetrial基础服务库
      "wetrial-signalr": "webapp/common/wetrial-signalr", // wetrial推送
      "wetrial-afk": "webapp/common/wetrial-afk", // wetrial afk(超时登出、登录互斥等)
      utils: "webapp/common/utils", // wetrial辅助工具库
      "electronic-signature":
            "webapp/nomui-components/electronic-signature/index", // 密码、短信电子签名验证
        "wetrial-chart": "webapp/nomui-components/wetrial-chart/index", // 图表
      // 三方组件，由于fullcalendar中写死了为FullCalendar，其余一律使用小写加-形式命名
      FullCalendar: "webapp/libs/fullcalendar/main", // 月历组件
      signalR: "webapp/libs/aspnet-signalr/signalr.min",
      msgpack5: "webapp/libs/aspnet-signalr/msgpack5.min",
      "signalr-protocol-msgpack":
            "webapp/libs/aspnet-signalr/signalr-protocol-msgpack.min",
        "homepage-footer": "webapp/common/homepage-footer",
        "pro-layout": "webapp/nomui-components/pro-layout/index", // 页面布局组件
        "pro-search": "webapp/nomui-components/pro-search/index", // 高级搜索面板组件
    },
    shim: {
      FullCalendar: {
        exports: "FullCalendar",
        deps: ["css!/webapp/libs/fullcalendar/main.css"],
      },
    },
  });

  require([], function () {
      axios.interceptors.request.use((config) => {
          if (config.loading) {
              var container =
                  config.loading === true ? document.body : config.loading;
              config.loadingInst = new nomui.Loading({ container: container });
          }

          let crypto = config.crypto;
          if (crypto) {
              config.cryptoKey = wt.crypto.generateKey();
              config.headers["Triple_DES_Key"] = wt.crypto.encryptKey(
                  config.cryptoKey
              );
              if (crypto === 1 || crypto === 4) {
                  config.data = wt.crypto.encrypt(config.data, config.cryptoKey);
              }
          }
          config.headers["X-Requested-With"] = "XMLHttpRequest";
          return config;
      });

      axios.interceptors.response.use(
          (response) => {
              let { loadingInst, cryptoKey, crypto, skipResponseInterceptors } =
                  response.config;
              if (loadingInst) {
                  loadingInst.remove && loadingInst.remove();
              }
              // 配置了跳过拦截器
              if (skipResponseInterceptors) {
                  return response;
              }
              let data = response.data;
              if (data && data.success === false) {
                  new nomui.Alert({
                      type: "warning",
                      title: data.message,
                      size: "xssmall",
                  });
                  return Promise.reject(data);
              }
              if (crypto === 2 || crypto === 4) {
                  response.data = wt.crypto.decryptResponse(response.data, cryptoKey);
              }
              return response.data;
          },
          ({ response }) => {
              let { loadingInst } = response.config;
              if (loadingInst) {
                  loadingInst.remove && loadingInst.remove();
              }
              new nomui.Alert({
                  type: "error",
                  title: "网络或服务器故障！！！",
                  size: "xssmall",
              });
              return Promise.reject(response);
          }
      );

    win.nomapp = new nomui.App({
        viewsDir: "/webapp/institutiondb",
      defaultPath: "!",
      isFixedLayout: false,
    });

    win.nomapp.context = JSON.parse(Base64.decode(win.context));
    
  });
})(window);
