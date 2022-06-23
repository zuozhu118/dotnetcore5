using Microsoft.AspNetCore.Mvc;

namespace WebCore.Controllers
{
    public class InstitutionDBController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
