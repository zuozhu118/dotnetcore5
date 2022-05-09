using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SelfReference
{
    class province_city_config : IEntityTypeConfiguration<Province_City>
    {
        public void Configure(EntityTypeBuilder<Province_City> builder)
        {
            builder.ToTable("t_province_city");
            builder.Property(a => a.name).HasColumnType("nvarchar(20)");
            builder.HasOne<Province_City>(a => a.parent).WithMany();
        }
    }
}
