using System.ComponentModel.DataAnnotations;
using NHibernate.Mapping.Attributes;

namespace WebCatalog.Models
{
    [Class]
    public class Customer : ModelBase
    {
        [Property]
        [Required]
        public virtual string Name { get; set; }
        [Property]
        [Required]
        [StringLength(9)]
        [RegularExpression(@"([0-9]{4})-([0-9]{4})", ErrorMessage = "Value must correspond to format: 0000-0000")]
        public virtual string Code { get; set; }
        [Property]
        public virtual string Address { get; set; }
        [Property]
        [Range(0, 100, ErrorMessage = "Value must be in range: 0 - 100")]
        public virtual double Discount { get; set; }
    }
}
