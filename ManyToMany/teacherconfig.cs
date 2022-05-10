using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ManyToMany
{
    class teacherconfig : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            builder.ToTable("t_teacher");
            builder.Property(a => a.tname).HasColumnType("nvarchar(20)");

            builder.HasMany<Student>(a => a._student).WithMany(b => b._teacher).UsingEntity(c => c.ToTable("t_teacher_student"));
        }
    }
}
