using Newtonsoft.Json;
using NHibernate.Mapping.Attributes;
using WebCatalog.Utils;

namespace WebCatalog.Models
{
    [Class]
    public class ModelBase
    {
        [Id]
        [JsonConverter(typeof(NullToDefaultConverter<Guid>))]
        public virtual Guid Id { get; set; }
    }
}
