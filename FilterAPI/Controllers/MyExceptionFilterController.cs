using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FilterAPI.Controllers
{
    /// <summary>
    /// exception 异常过滤器；
    /// </summary>
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MyExceptionFilterController : ControllerBase
    {
        [HttpGet]
        public double GetDivision(int n1, int n2)
        {
            //尝试除以0，抛出一个异常：

            return n1 / n2;
        }
    }
}
