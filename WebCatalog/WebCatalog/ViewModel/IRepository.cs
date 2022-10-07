using System.Linq.Expressions;
using WebCatalog.Models;

namespace WebCatalog.ViewModel
{
    public interface IRepository
    {
        void Save(object obj);
        void Delete(object obj);
        object GetById(Type objType, object objId);
        void BeginTransaction();
        void CommitTransaction();
        void RollbackTransaction();
        List<TModel> ToList<TModel>(int pageIndex = 0, int pageSize = 0);
        List<TModel> Query<TModel>(Expression<Func<TModel, bool>> expr);
    }
}
