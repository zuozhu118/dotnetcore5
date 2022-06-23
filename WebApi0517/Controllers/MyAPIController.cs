using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebApi0517.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MyAPIController : ControllerBase
    {

        [HttpGet]
        public ActionResult<string> GetStudent(int id)
        {
            if (id==1)
            {
                return "aa";
            }
            else if (id==2)
            {
                return "bb";
            }
            else
            {
                return NotFound("id不对！");
            }
        }

        [HttpPost]
        public Person GetDetail(Person person)
        {
            Person p = new Person();
            p.name= $"hello {person.name}!!!";
            p.salary=person.salary+5;

            return p;
        }


        private readonly TestService _TestService ;

        public MyAPIController(TestService TestService)
        {
            this._TestService = TestService;
        }

        [HttpGet]
        public int CalAge(int n1,int n2)
        {
            return _TestService.CalculateAge(n1,n2);
        }

    }
}
