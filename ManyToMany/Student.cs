using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ManyToMany
{
   public class Student
    {
        public long id { get; set; }
        public string sname { get; set; }

        public List<Teacher> _teacher { get; set; } = new List<Teacher>();
    }
}
