using System;

/// <summary>
/// 多对多关系：一个老师有多个学生，一个学生有多个老师；
/// </summary>
namespace ManyToMany
{
    class Program
    {
        static void Main(string[] args)
        {
            using (DataBase db=new DataBase())
            {
                Student st1 = new Student();
                st1.sname = "武松";
                Student st2 = new Student();
                st2.sname = "林冲";
                Student st3 = new Student();
                st3.sname = "松江";
                Student st4 = new Student();
                st4.sname = "李逵";
                Student st5 = new Student();
                st5.sname = "鲁智深";

                Teacher t1 = new Teacher();
                t1.tname = "Tom";
                t1._student.Add(st1);
                t1._student.Add(st3);

                Teacher t2 = new Teacher();
                t2.tname = "Jerry";
                t2._student.Add(st2);
                t2._student.Add(st3);
                t2._student.Add(st5);

                Teacher t3 = new Teacher();
                t3.tname = "Tony";
                t3._student.Add(st1);
                t3._student.Add(st2);
                t3._student.Add(st4);
                t3._student.Add(st5);

                db.Teacher.Add(t1);
                db.Teacher.Add(t2);
                db.Teacher.Add(t3);
                db.SaveChanges();
            }
        }
    }
}
