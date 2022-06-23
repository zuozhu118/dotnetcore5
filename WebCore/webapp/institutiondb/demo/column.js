define(["wetrial-chart"], function (WetrialChart) {
  return function () {
    const title = "图表";

    const data = [
      {
        type: "家具家电",
        sales: 38,
      },
      {
        type: "粮油副食",
        sales: 52,
      },
      {
        type: "生鲜水果",
        sales: 61,
      },
      {
        type: "美容洗护",
        sales: 145,
      },
      {
        type: "母婴用品",
        sales: 48,
      },
      {
        type: "进口食品",
        sales: 38,
      },
      {
        type: "食品饮料",
        sales: 38,
      },
      {
        type: "家庭清洁",
        sales: 38,
      },
    ];

    return {
      title: title,
      view: {
        children: {
          component: "Layout",
          header: {
            children: {
              component: "Navbar",
              caption: { title },
              nav: {},
            },
          },
          body: {
            children: {
              component: "Rows",
              styles: {
                padding: 4,
              },
              items: [
                {
                  component: WetrialChart,
                  type: "Column",
                  chartProps: {
                    data,
                    xField: "type",
                    yField: "sales",
                    label: {
                      // 可手动配置 label 数据标签位置
                      position: "middle", // 'top', 'bottom', 'middle',
                      // 配置样式
                      style: {
                        fill: "#FFFFFF",
                        opacity: 0.6,
                      },
                    },
                    xAxis: {
                      label: {
                        autoHide: true,
                        autoRotate: true,
                      },
                    },
                    meta: {
                      type: {
                        alias: "类别",
                      },
                      sales: {
                        alias: "销售额",
                      },
                    },
                    minColumnWidth: 20,
                    maxColumnWidth: 20,
                  },
                  //   _rendered(inst) {
                  //     inst.chart.on("element:click", (e) => {
                  //       console.log(e);
                  //     });
                  //   },
                },
              ],
            },
          },
        },
      },
    };
  };
});
