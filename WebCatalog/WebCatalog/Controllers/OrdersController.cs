using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Linq;
using WebCatalog.Constants;
using WebCatalog.Models;
using WebCatalog.ViewModel;

namespace WebCatalog.Controllers
{
    [Authorize(Roles = Global.ManagerAndCustomer)]
    public class OrdersController : WorkWithDataController
    {
        [HttpGet("Orders")]
        public IActionResult Orders()
        {
            return View();
        }

        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public Order SubmitOrder(Guid orderId)
        {
            try
            {
                var unitOfWork = PrepareTransaction();
                var order = (Order)unitOfWork.Repository.GetById(typeof(Order), orderId);
                order.Status = Global.StatusInProgress;
                order.ShipmentDate = DateTime.Today;
                //transaction
                unitOfWork.Save(order);
                unitOfWork.Commit();
                return order;
            }
            catch (Exception e)
            {
                return null;
            }

            return null;
        }
        [HttpPost]
        [Authorize(Roles = Global.Manager)]
        public Order FinishOrder(Guid orderId)
        {
            try
            {
                var unitOfWork = PrepareTransaction();
                var order = (Order)unitOfWork.Repository.GetById(typeof(Order), orderId);
                order.Status = Global.StatusComplete;
                //transaction
                unitOfWork.Save(order);
                unitOfWork.Commit();
                return order;
            }
            catch (Exception e)
            {
                return null;
            }

            return null;
        }

        [HttpPost]
        public IActionResult CancelOrder(Guid orderId)
        {
            try
            {
                var unitOfWork = PrepareTransaction();
                var order = (Order)unitOfWork.Repository.GetById(typeof(Order), orderId);
                if (order.Status == Global.StatusNew)
                {
                    order.Status = Global.StatusCanceled;
                    //transaction
                    unitOfWork.Save(order);
                    unitOfWork.Commit();
                    return Ok();
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            return BadRequest();
        }

        public IList<Order> GetOrders()
        {
            var unitOfWork = new UnitOfWork(new Repository());
            
            if (CurrentUser.Role == Global.Manager)
            {
                return unitOfWork.Repository.Query<Order>(order => order.Status == Global.StatusNew || order.Status == Global.StatusInProgress);
            }
            else
            {
                return unitOfWork.Repository.Query<Order>(order => order.Customer.Id == CurrentUser.Customer.Id && (order.Status == Global.StatusNew));
            }
        }
    }
}
