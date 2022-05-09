using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneToMany
{
    /// <summary>
    /// 用户评论表
    /// </summary>
    class comment
    {
        public long id { get; set; }

        public string user_comments { get; set; }

        public DateTime pubdate { get; set; }

        public string userid { get; set; }

        public article _article { get; set; }

    }
}
