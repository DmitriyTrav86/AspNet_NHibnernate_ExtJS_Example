using System.Linq.Expressions;
using FluentNHibernate.Data;
using NHibernate;
using NHibernate.Linq;
using WebCatalog.Models;
using ISession = NHibernate.ISession;

namespace WebCatalog.ViewModel
{
    public class Repository : IRepository, IDisposable
    {
        protected ISession _session = null;
        protected ITransaction _transaction = null;
        private int _operationCounter = 0;

        public Repository()
        {
            _session = Database.OpenSession();
        }

        #region Transaction and Session Management Methods

        public void BeginTransaction()
        {
            _transaction = _session.BeginTransaction();
        }

        public void CommitTransaction()
        {
            
            // _transaction will be replaced with a new transaction            // by NHibernate, but we will close to keep a consistent state.
            _transaction.Commit();

            CloseTransaction();
        }

        public void RollbackTransaction()
        {
            // _session must be closed and disposed after a transaction            // rollback to keep a consistent state.
            _transaction.Rollback();

            CloseTransaction();
            CloseSession();
        }

        private void CloseTransaction()
        {
            _transaction.Dispose();
            _transaction = null;
        }

        private void OperationCounterUpdate()
        {
            _operationCounter++;
            if (_operationCounter == 20)
            {
                _session.Flush();
                _session.Clear();
                _operationCounter = 0;
            }
        }

        private void CloseSession()
        {
            _session.Close();
            _session.Dispose();
            _session = null;
        }

        #endregion

        #region IRepository Members

        public virtual void Save(object obj)
        {
            _session.SaveOrUpdate(obj);
            OperationCounterUpdate();
        }

        public virtual void Delete(object obj)
        {
            _session.Delete(obj);
            OperationCounterUpdate();
        }

        public virtual object GetById(Type objType, object objId)
        {
            return _session.Load(objType, objId);
        }

        public List<TModel> Query<TModel>(Expression<Func<TModel, bool>> expr)
        {
            List<TModel> users =
                _session.Query<TModel>()
                    .Where(expr)
                    .ToList();

            return users;
        }

        public List<TModel> ToList<TModel>(int pageIndex = 0, int pageSize = 0)
        {
            var objects = pageSize == 0 
                ? _session
                    .CreateCriteria(typeof(TModel))
                    .List() 
                : _session
                    .CreateCriteria(typeof(TModel))
                    .SetFirstResult(pageIndex * pageSize)
                    .SetMaxResults(pageSize)
                    .List();

            return objects.Cast<TModel>().ToList();
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            // Commit transaction by default, unless user explicitly rolls it back.
            // To rollback transaction by default, unless user explicitly commits,                // comment out the line below.
            CommitTransaction();

            _session.Flush(); // commit session transactions
            CloseSession();
        }

        #endregion
    }
}
