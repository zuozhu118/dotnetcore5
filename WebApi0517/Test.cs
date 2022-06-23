using Microsoft.AspNetCore.Mvc;

namespace WebApi0517
{
    /// <summary>
    ///将一个普通的类，设置为控制器；
    /// </summary>
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class Test
    {
        [HttpGet]
        public int M1(int n1,int n2)
        { 
            return n1+n2; 
        }
    }
}
