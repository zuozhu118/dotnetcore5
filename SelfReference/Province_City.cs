using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SelfReference
{
    class Province_City
    {
        public Guid id { get; set; }
        public string name { get; set; }

        public Province_City parent { get; set; }
    }
}
