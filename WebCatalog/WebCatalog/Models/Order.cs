using System.Text.Json.Serialization;
using NHibernate.Mapping.Attributes;

namespace WebCatalog.Models
{
    [Class]
    public class Order : ModelBase
    {
        [Property]
        [JsonIgnore]
        public virtual Customer Customer { get; set; }
        [Property]
        public virtual DateTime? OrderDate { get; set; }
        [Property]
        public virtual DateTime? ShipmentDate { get; set; }
        [Property]
        public virtual int? OrderNumber { get; set; }
        [Property]
        public virtual string Status { get; set; }
        [Property]
        public virtual IList<Position> Positions { get; set; }
    }
}
