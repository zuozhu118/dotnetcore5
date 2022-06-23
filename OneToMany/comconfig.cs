using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace OneToMany
{
    class comconfig : IEntityTypeConfiguration<comment>
    {
        /// <summary>
        /// 一篇文章有多个评论
        /// </summary>
        /// <param name="builder"></param>
        public void Configure(EntityTypeBuilder<comment> builder)
        {
            builder.ToTable("t_comment");
            builder.Property(a => a.userid).HasColumnType("varchar(20)");
            builder.Property(a => a.user_comments).HasColumnType("nvarchar(100)");
            builder.HasOne<article>(a => a._article).WithMany().IsRequired();
        }
    }
}
