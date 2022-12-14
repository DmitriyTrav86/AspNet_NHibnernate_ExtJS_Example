using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using WebCatalog.Constants;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.AccessDeniedPath = "/denied";
        options.Events = new CookieAuthenticationEvents()
        {
            OnSigningIn = async context =>
            {
                var principal = context.Principal;
                var claimRole = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                if (claimRole != null)
                {
                    if (claimRole.Value == Global.Manager)
                    {
                        var claimsIdentity = principal.Identity as ClaimsIdentity;
                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, Global.Manager));
                    }
                }
                await Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
