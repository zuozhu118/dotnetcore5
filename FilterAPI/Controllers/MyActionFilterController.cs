using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FilterAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MyActionFilterController : ControllerBase
    {
        [HttpGet]
        public int M1(int n1,int n2)
        {
            int result= n1 + n2;
            Console.WriteLine($"M1方法执行了！");
            return result;
        }

        [HttpGet]
        public int M2(int n1, int n2)
        {
            int result = n1 + n2;
            Console.WriteLine($"M2方法执行了！");
            return result;
        }
    }
}
