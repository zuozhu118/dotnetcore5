using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ManyToMany;
using Microsoft.EntityFrameworkCore;


/// <summary>
/// EFCore执行原生的sql操作；
/// </summary>
namespace NativeSQL
{
    class Program
    {
        static async Task Main(string[] args)
        {
            //int result = await ExecuteAddUpdateDeleteSql();
            //Console.WriteLine(result);

            var query= await ExecuteQuerySql();
            foreach (var item in query)
            {
                Console.WriteLine(item.sname);
            }

        }

        static async Task<int> ExecuteAddUpdateDeleteSql()
        {
            using (DataBase db = new DataBase())
            {
                //1、用原生的sql语句执行增删改操作：
                string sname = "吴用";
                int result = 0;
                int id = 3;

                //添加：
                //result = await db.Database.ExecuteSqlInterpolatedAsync($"insert into t_student(sname) values({sname})");
                //修改：
                //result = await db.Database.ExecuteSqlInterpolatedAsync($"update t_student set sname={sname} where id={id}");
                //删除：
                result = await db.Database.ExecuteSqlInterpolatedAsync($"delete from t_student where sname={sname}");

                return result;
            }
        }


        static async Task<List<Student>> ExecuteQuerySql()
        {
            using (DataBase db=new DataBase())
            {
                //FromSqlInterpolated只能查单表，并且要查这个表的全部列；
                List<Student> result = await db.Student.FromSqlInterpolated($"select id, sname from t_student").ToListAsync();

                return result;
            }
        }
    }
}
