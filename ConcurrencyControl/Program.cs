using System;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Text;

/// <summary>
/// 并发控制：乐观并发控制；
/// </summary>
namespace ConcurrencyControl
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("请输入你的姓名111：");
            string name = Console.ReadLine();
            
            using (DataBase db = new DataBase())
            {
                using (var bg=db.Database.BeginTransaction())
                {
                    //Guid? oldguid = null;
                    House house = await db.House.FirstOrDefaultAsync(a => a.id == 1);

                    //oldguid= house.RowVersion_GUID;
                    //模拟并发：
                    Thread.Sleep(5000);

                    //Console.WriteLine("旧的："+oldguid);

                    //house = await db.House.FirstOrDefaultAsync(a => a.id == 1&&a.RowVersion_GUID==oldguid);

                    try
                    {
                        house.owner = name;

                        //house.RowVersion_GUID = Guid.NewGuid();



                        db.SaveChanges();

                        Console.WriteLine("新的：" + house.RowVersion_GUID);

                        //事务提交
                        bg.Commit();

                        Console.WriteLine("抢购成功！");
                    }
                    catch (DbUpdateConcurrencyException ex)
                    {
                        //事务回滚
                        //bg.Rollback();

                        var entry = ex.Entries.First();
                        var dbvalues = await entry.GetDatabaseValuesAsync();
                        string newowner = dbvalues.GetValue<string>(nameof(house.owner));

                        Console.WriteLine($"并发冲突：房子已经被：{newowner}抢走了！！！");
                        
                    }

                    Console.ReadKey();
                }
            }
        }
    }
}
