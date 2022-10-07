//using System.Reflection;

//namespace WebCatalog.ViewModel
//{
//    public class RepositoryTest : IRepository
//    {
//        #region IRepository Members

//        public void Save(object obj)
//        {
//            // Assume save success.
//        }

//        public void Delete(object obj)
//        {
//            // Assume delete success.
//        }

//        public object GetById(Type objType, object objId)
//        {
//            // Get it's constructor
//            ConstructorInfo constructor = objType.GetConstructor(new Type[] { });

//            // Invoke it's constructor, which returns an instance.
//            object createdObject = constructor.Invoke(null);

//            return createdObject;
//        }

//        public List<TEntity> ToList<TEntity>()
//        {
//            List<TEntity> resultList = new List<TEntity>();

//            Type objType = typeof(TEntity);

//            // Get it's constructor
//            ConstructorInfo constructor = objType.GetConstructor(new Type[] { });

//            // Invoke it's constructor, which returns an instance.
//            object createdObject = constructor.Invoke(null);

//            resultList.Add((TEntity)createdObject);

//            return resultList;
//        }

//        #endregion
//    }
//}
