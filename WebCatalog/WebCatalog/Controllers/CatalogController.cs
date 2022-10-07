using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using NHibernate.Mapping.Attributes;
using WebCatalog.Constants;
using WebCatalog.Models;
using WebCatalog.ViewModel;

namespace WebCatalog.Controllers
{
    [Authorize(Roles = Global.ManagerAndCustomer)]
    public class CatalogController : WorkWithDataController
    {
        [HttpGet("Catalog")]
        public IActionResult Catalog()
        {
            return View();
        }

        public Customer GetCurrentCustomer() {
            return CurrentUser.Customer;
        }

        private Order CreateOrder(List<Position> positions)
        {
            var order = new Order() {Customer = CurrentUser.Customer, OrderDate = DateTime.Today, Status = Global.StatusNew};
            var unitOfWork = new UnitOfWork(new Repository());
            var itemIds = positions.Select(p => p.Item.Id).ToList();
            var items = unitOfWork.Repository.Query<Item>(item => itemIds.Contains(item.Id));
           
            foreach (var position in positions)
            {
                position.Item = items.First(i => i.Id == position.Item.Id);
                position.ItemPrice = position.Item.Price;
                position.Order = order;
            }

            order.Positions = positions;
            return order;
        }

        public IActionResult Checkout(string positionsJson)
        {
            try
            {
                var positions = JsonConvert.DeserializeObject<List<Position>>(positionsJson);
                if (positions != null && positions.Any())
                {
                    var order = CreateOrder(positions);
                    var unitOfWork = PrepareTransaction();
                    unitOfWork.Save(order);
                    unitOfWork.Commit();
                    return Ok();
                }
            }
            catch (Exception e)
            {
                BadRequest(e.Message);
            }
            return BadRequest();
        }

        public List<Item> GetItems(int start, int limit)
        {
            var unitOfWork = new UnitOfWork(new Repository());
            return unitOfWork.Repository.ToList<Item>();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult RemoveItem(string itemJson)
        {
            var item = JsonConvert.DeserializeObject<Item>(itemJson);
            if (item != null)
            {
                //transaction
                var unitOfWork = PrepareTransaction();
                unitOfWork.Delete(item);
                unitOfWork.Commit();
                return Ok();
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult UpdateItem(string itemJson)
        {
            var item = JsonConvert.DeserializeObject<Item>(itemJson);
            if (item != null)
            {
                //Server validation
                var validationErrors = GetValidationErrors(item);
                if (validationErrors != null)
                {
                    return BadRequest(validationErrors);
                }

                //transaction
                var unitOfWork = PrepareTransaction();
                unitOfWork.Save(item);
                unitOfWork.Commit();
                return Ok();
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public IActionResult CreateItem(string itemJson)
        {
            var item = JsonConvert.DeserializeObject<Item>(itemJson);
            if (item != null)
            {
                //Server validation
                var validationErrors = GetValidationErrors(item);
                if (validationErrors != null)
                {
                    return BadRequest(validationErrors);
                }

                //transaction
                try
                {
                    var unitOfWork = PrepareTransaction();
                    unitOfWork.Save(item);
                    unitOfWork.Commit();
                    return Ok(item.Id.ToString());
                }
                catch (Exception e)
                {
                    return BadRequest(e.Message);
                }
            }
            return BadRequest();
        }
        [Class]
        public class CustomerData
        {
            [Property]
            public Customer Customer { get; set; }
            [Property]
            public Order? Order { get; set; }
        }
    }
}
