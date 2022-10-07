using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using WebCatalog.Constants;
using WebCatalog.Models;
using WebCatalog.ViewModel;

namespace WebCatalog.Controllers
{
    public class SecurityController : WorkWithDataController
    {
        [HttpGet("login")]
        public IActionResult Login(string returnUrl)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Validate(string username, string password, string returnUrl)
        {
            ViewData["ReturnUrl"] = returnUrl;

            var unitOfWork = new UnitOfWork(new Repository());
            var users = unitOfWork.Repository.Query<User>(user => user.Username == username && user.Password == password);

            if (users.Any())
            {
                var claims = new List<Claim>();
                claims.Add(new Claim("username", username));
                claims.Add(new Claim(ClaimTypes.NameIdentifier, username));
                claims.Add(new Claim(ClaimTypes.Name, username));
                claims.Add(new Claim("id", users.First().Id.ToString()));
                claims.Add(new Claim(ClaimTypes.Role, users.First().Role));
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
                await HttpContext.SignInAsync(claimsPrincipal);
                return Redirect(string.IsNullOrEmpty(returnUrl) ? "/" : returnUrl);
            }

            TempData["Error"] = "Error. Username or Password is invalid";
            return View("login");
        }

        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return Redirect("/");
        }

        [HttpGet("denied")]
        public IActionResult Denied()
        {
            return View();
        }

        [HttpGet("UserManagement")]
        [Authorize(Roles = Global.Manager)]
        public IActionResult UserManagement()
        {
            return View();
        }

        [Authorize(Roles = Global.Manager)]
        public List<User> GetUsers(int start, int limit)
        {
            var unitOfWork = new UnitOfWork(new Repository());
            return unitOfWork.Repository.ToList<User>();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult RemoveUser(string userJson)
        {
            var user = JsonConvert.DeserializeObject<User>(userJson);
            if (user != null)
            {
                //transaction
                var unitOfWork = PrepareTransaction();
                unitOfWork.Delete(user);
                unitOfWork.Commit();
                return Ok();
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult UpdateUser(string userJson)
        {
            var user = JsonConvert.DeserializeObject<User>(userJson);
            if (user != null)
            {
                //Server validation
                var validationErrors = GetValidationErrors(user);
                if (validationErrors != null)
                {
                    return BadRequest(validationErrors);
                }

                //transaction
                var unitOfWork = PrepareTransaction();
                unitOfWork.Save(user);
                unitOfWork.Commit();
                return Ok();
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult CreateUser(string userJson)
        {
            var user = JsonConvert.DeserializeObject<User>(userJson);
            if (user != null)
            {
                //Server validation
                var validationErrors = GetValidationErrors(user);
                if (validationErrors != null)
                {
                    return BadRequest(validationErrors);
                }

                //transaction
                try
                {
                    var unitOfWork = PrepareTransaction();
                    unitOfWork.Save(user);
                    unitOfWork.Commit();
                    return Ok(JsonConvert.SerializeObject(user));
                }
                catch (Exception e)
                {
                    return BadRequest(e.Message);
                }
            }
            return BadRequest();
        }
    }
}
