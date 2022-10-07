using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using WebCatalog.Models;
using WebCatalog.Constants;

namespace WebCatalog.Controllers
{
    [Authorize(Roles = Global.ManagerAndCustomer)]
    public class HomeController : Controller
    {
        public HomeController(ILogger<HomeController> logger)
        {
        }
        [AllowAnonymous]
        public IActionResult Index()
        {
            return View();
        }
        
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}