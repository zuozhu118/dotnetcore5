using System;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

/// <summary>
/// 并发控制：乐观并发控制；
/// </summary>
namespace ConcurrencyControl
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("请输入你的姓名：");
            string name = Console.ReadLine();
            
            using (DataBase db = new DataBase())
            {
                using (var bg=db.Database.BeginTransaction())
                {
                    House house = await db.House.FirstOrDefaultAsync(a => a.id == 1);

                    //模拟并发：
                    Thread.Sleep(5000);

                    try
                    {
                        house.owner = name;

                        house.RowVersion_GUID = Guid.NewGuid();
                        
                        db.SaveChanges();

                        //事务提交
                        bg.Commit();
                    }
                    catch (DbUpdateConcurrencyException ex)
                    {
                        //事务回滚
                        bg.Rollback();

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
