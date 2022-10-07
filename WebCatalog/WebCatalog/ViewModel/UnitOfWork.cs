namespace WebCatalog.ViewModel
{
    public class UnitOfWork : IUnitOfWork
    {
        private List<Object> _toUpsertObjects = new List<Object>();
        private List<Object> _toDeleteObjects = new List<Object>();

        public void Save(object obj)
        {
            _toUpsertObjects.Add(obj);
        }

        public void Delete(object obj)
        {
            _toDeleteObjects.Add(obj);
        }
        
        public IRepository Repository;
        public UnitOfWork(IRepository repository)
        {
            Repository = repository;
        }
        public void Commit()
        {
            ApplyChanges();
            Repository.CommitTransaction();
        }

        public void Rollback()
        {
            Repository.RollbackTransaction();
        }

        private void ApplyChanges()
        {
            foreach (var obj in _toUpsertObjects)
            {
                Repository.Save(obj);
            }
            _toUpsertObjects.Clear();

            foreach (var obj in _toDeleteObjects)
            {
                Repository.Delete(obj);
            }
            _toDeleteObjects.Clear();
        }
    }
}
