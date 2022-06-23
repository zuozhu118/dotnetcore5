using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ConcurrencyControlAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ConcurrencyControlController : ControllerBase
    {
        private readonly MyDbContext db;

        public ConcurrencyControlController(MyDbContext myDbContext )
        {
            this.db = myDbContext;
        }

        /// <summary>
        /// 用GUID模拟RowVersion
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<string> ConcurrencyControlGUID(string name)
        {
            using (var bg = db.Database.BeginTransaction())
            {
                Guid? oldguid = null;
                House? house = await db.House.FirstOrDefaultAsync(a => a.id == 1);

                oldguid = house.RowVersion_GUID;
                //模拟并发：
                Thread.Sleep(5000);

                house = await db.House.FirstOrDefaultAsync(a => a.id == 1 && a.RowVersion_GUID == oldguid);

                try
                {
                    house.owner = name;

                    house.RowVersion_GUID = Guid.NewGuid();


                    db.SaveChanges();

                    
                    //事务提交
                    bg.Commit();

                    return "抢购成功！";
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    //事务回滚
                    //bg.Rollback();

                    var entry = ex.Entries.First();
                    var dbvalues = await entry.GetDatabaseValuesAsync();
                    string newowner = dbvalues.GetValue<string>(nameof(house.owner));

                    return  $"并发冲突：房子已经被：{newowner}抢走了！！！";

                }

            }
        }
    }
}
