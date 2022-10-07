namespace WebCatalog.ViewModel
{
    public interface IUnitOfWork
    {
        void Commit();
        void Rollback();
    }
}
