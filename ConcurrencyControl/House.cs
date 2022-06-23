using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConcurrencyControl
{
    /// <summary>
    /// 抢购房子表，房子卖出去一套，owner字段保存购买者姓名；
    /// </summary>
    class House
    {
        public int id { get; set; }
        /// <summary>
        /// 房子的拥有者；
        /// </summary>
        public string owner { get; set; }
        public double price { get; set; }
        public string address { get; set; }


        public byte[] RowVersion { get; set; }


        /// <summary>
        /// 不用RowVersion,用一个GUID列来模拟
        /// </summary>
        public Guid? RowVersion_GUID { get; set; }
    }
}
