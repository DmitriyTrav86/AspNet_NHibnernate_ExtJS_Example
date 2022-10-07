using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WebCatalog.Models;
using WebCatalog.ViewModel;

namespace WebCatalog.Controllers
{
    public class WorkWithDataController : Controller
    {
        private User _currentUser;
        protected User CurrentUser
        {
            get
            {
                if (_currentUser == null)
                {
                    var idClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
                    if (idClaim != null)
                    {
                        var unitOfWork = new UnitOfWork(new Repository());
                        _currentUser = (User)unitOfWork.Repository.GetById(typeof(User), Guid.Parse(idClaim.Value));
                    }
                }

                return _currentUser;
            }
        }

        protected static UnitOfWork PrepareTransaction()
        {
            var repository = new Repository();
            repository.BeginTransaction();
            var unitOfWork = new UnitOfWork(repository);
            return unitOfWork;
        }

        protected static string? GetValidationErrors(ModelBase item)
        {
            var ctx = new ValidationContext(item, null, null);
            var errors = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(item, ctx, errors, true);

            if (!isValid)
            {
                return string.Join(", ", errors.Select(e => e.ErrorMessage));
            }

            return null;
        }
    }
}
