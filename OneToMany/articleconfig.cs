using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace OneToMany
{
    class articleconfig : IEntityTypeConfiguration<article>
    {
        public void Configure(EntityTypeBuilder<article> builder)
        {
            builder.ToTable("t_article");
            builder.Property(a => a.title).HasColumnType("nvarchar(20)");
            builder.Property(a=>a.createby).HasColumnType("nvarchar(20)");
            
        }
    }
}
