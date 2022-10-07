using System.Text.Json.Serialization;
using NHibernate.Mapping.Attributes;

namespace WebCatalog.Models
{
    [Class]
    public class Position : ModelBase
    {
        [Property]
        [JsonIgnore]
        public virtual Order Order { get; set; }
        [Property]
        public virtual Item Item { get; set; }
        [Property]
        public virtual int ItemsCount { get; set; }
        [Property]
        public virtual double ItemPrice { get; set; }
    }
}
