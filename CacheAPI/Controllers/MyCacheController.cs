using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CacheAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MyCacheController : ControllerBase
    {
        private readonly IMemoryCache _cache;

        public MyCacheController(IMemoryCache cache)
        {
            this._cache = cache;
        }


        [HttpGet]
        public string GetDateNow()
        {
            //GetOrCreate从key为nowtime的缓存中取数据，如果数据不存在创建缓存；
            //GetOrCreate不存在缓存穿透问题，推荐使用；
            string strtime = _cache.GetOrCreate<string>("nowtime", (a) =>
            {
                string dt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                return dt;
            });
            return strtime;
        }
    }
}
