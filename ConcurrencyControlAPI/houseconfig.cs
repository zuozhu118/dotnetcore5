using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConcurrencyControlAPI
{
    class houseconfig : IEntityTypeConfiguration<House>
    {
        public void Configure(EntityTypeBuilder<House> builder)
        {
            builder.ToTable("t_house");
            builder.Property(a => a.owner).HasColumnType("nvarchar(20)");
            builder.Property(a => a.address).HasColumnType("nvarchar(100)");

            //设置owner列为并发令牌：
            //builder.Property(a => a.owner).IsConcurrencyToken();
            //------------或者：------------
            //builder.Property(a => a.owner).IsRowVersion();

            //使用RowVersion属性，设置为并发令牌；
            //builder.Property(a => a.RowVersion).IsRowVersion();
        }
    }
}
