using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManyToMany
{
    class Teacher
    {
        public long id { get; set; }
        public string tname { get; set; }

        public List<Student> _student { get; set; } = new List<Student>();
    }
}
