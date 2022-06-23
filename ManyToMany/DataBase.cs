using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ManyToMany
{
    public class DataBase : DbContext
    {
        public DbSet<Student> Student { get; set; }

        public DbSet<Teacher> Teacher { get; set; }

        /// <summary>
        /// 连接字符串
        /// </summary>
        /// <param name="optionsBuilder"></param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string strcon = "Data Source=127.0.0.1;Initial Catalog=EF;Integrated Security=false;User ID=lqq;Password=zuozhu118;Application Name=xts";
            optionsBuilder.UseSqlServer(strcon);
        }

        /// <summary>
        /// 当前程序集里面实现了IEntityTypeConfiguration接口的所有的类
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(this.GetType().Assembly);
        }
    }
}
