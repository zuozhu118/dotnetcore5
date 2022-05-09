using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// 自引用关系：自己引用自己，类似于省市；
/// </summary>
namespace SelfReference
{
    class Program
    {
        /// <summary>
        /// li保存递归加载后的结果；
        /// </summary>
        public static List<Province_City> li = new List<Province_City>();

        /// <summary>
        /// 将插入的数据保存到results和中，最原始的结果集；
        /// </summary>
        public static List<Province_City> results = new List<Province_City>();

        static void Main(string[] args)
        {
            using (DataBase db = new DataBase())
            {
                Province_City pc1 = new Province_City();
                pc1.name = "湖北省";
                Province_City pc2 = new Province_City();
                pc2.name = "湖南省";

                Province_City pc3 = new Province_City();
                pc3.name = "武汉市";
                pc3.parent = pc1;
                Province_City pc7 = new Province_City();
                pc7.name = "武昌区";
                pc7.parent = pc3;
                Province_City pc4 = new Province_City();
                pc4.name = "孝感市";
                pc4.parent = pc1;
                Province_City pc8 = new Province_City();
                pc8.name = "安陆市";
                pc8.parent = pc4;
                Province_City pc9 = new Province_City();
                pc9.name = "应城市";
                pc9.parent = pc4;


                Province_City pc5 = new Province_City();
                pc5.name = "长沙市";
                pc5.parent = pc2;
                Province_City pc6 = new Province_City();
                pc6.name = "常德市";
                pc6.parent = pc2;

                db.province_city.Add(pc3);
                db.province_city.Add(pc4);
                db.province_city.Add(pc5);
                db.province_city.Add(pc6);
                db.province_city.Add(pc7);
                db.province_city.Add(pc8);
                db.province_city.Add(pc9);
                db.SaveChanges();
                results = db.province_city.ToList();
            }
            

            IEnumerable<Province_City> pcs = results.Where(a => a.parent == null);
            foreach (var item in pcs)
            {
                li.Add(item);
                PrintProvinceCity(item);
            }

            //打印输出到控制台：
            foreach (var list in li)
            {
                Console.WriteLine(list.name + "\r\n");
            }
            Console.ReadKey();
        }

        /// <summary>
        /// 递归加载，深度优先；
        /// </summary>
        /// <param name="pc"></param>
        public static void PrintProvinceCity(Province_City pc)
        {
            if (pc == null)
            {
                return;
            }
            else
            {
                IEnumerable<Province_City> pcs = results.Where(a => a.parent == pc);
                foreach (var item in pcs)
                {
                    li.Add(item);
                    PrintProvinceCity(item);
                }
            }

        }
    }
}
