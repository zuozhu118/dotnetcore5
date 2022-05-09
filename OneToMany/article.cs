using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneToMany
{
    /// <summary>
    /// 文章表：一篇文章有多个用户评论；
    /// </summary>
    class article
    {
        public Guid id { get; set; }
        public string title { get; set; }
        public DateTime createtime { get; set; }
        public string createby { get; set; }
        public bool isdisabled { get; set; }

        //public List<comment> _comment { get; set; } = new List<comment>();
    }
}
