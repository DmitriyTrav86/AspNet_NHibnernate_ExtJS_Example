using NHibernate;
using NHibernate.Cfg;

namespace WebCatalog.ViewModel
{
    public static class Database
    {
        private static ISessionFactory _sessionFactory;

        private static ISessionFactory SessionFactory
        {
            get
            {
                if (_sessionFactory == null)
                {
                    var configuration = new Configuration();
                    var configurePath = Path.GetFullPath("Nhibernate.cfg.xml");
                    configuration.Configure(configurePath);

                    //adding mappings of models
                    var mappingFilePath = Path.GetFullPath("Mappings.hbm.xml");
                    configuration.AddFile(mappingFilePath);

                    ISessionFactory sessionFactory = configuration.BuildSessionFactory();

                    _sessionFactory = sessionFactory;
                }

                return _sessionFactory;
            }
        }

        public static NHibernate.ISession OpenSession()
        {
            return SessionFactory.OpenSession();
        }
    }
}
