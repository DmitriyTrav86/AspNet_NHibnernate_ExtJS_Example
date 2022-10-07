using NHibernate.Mapping.Attributes;
using System.ComponentModel.DataAnnotations;

namespace WebCatalog.Models
{
    [Class]
    public class Item : ModelBase
    {
        [Property]
        [Required]
        [StringLength(12)]
        [RegularExpression(@"([0-9]{2})-([0-9]{4})-([A-Z]{2}[0-9]{2})", ErrorMessage = "Value must correspond to format: 00-0000-AA00")]
        public virtual string Code { get; set; }
        [Property]
        public virtual string Name { get; set; }
        [Property]
        [Required]
        [Range(0.1, double.MaxValue, ErrorMessage = "Value must be greater than 0")]
        public virtual double Price { get; set; }
        [Property]
        public virtual string Category { get; set; }
    }
}
