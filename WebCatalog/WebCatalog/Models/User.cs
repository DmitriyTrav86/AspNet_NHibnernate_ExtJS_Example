using NHibernate.Mapping.Attributes;

namespace WebCatalog.Models
{
    [Class]
    public class User : ModelBase
    {
        [Property]
        public virtual Customer Customer { get; set; }
        [Property]
        public virtual string Role { get; set; }
        [Property]
        public virtual string Username { get; set; }
        [Property]
        public virtual string Password { get; set; }
    }
}
