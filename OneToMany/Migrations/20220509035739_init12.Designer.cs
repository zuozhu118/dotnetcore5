﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using OneToMany;

namespace OneToMany.Migrations
{
    [DbContext(typeof(DataBase))]
    [Migration("20220509035739_init12")]
    partial class init12
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("ProductVersion", "5.0.16")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("OneToMany.article", b =>
                {
                    b.Property<Guid>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("createby")
                        .HasColumnType("nvarchar(20)");

                    b.Property<DateTime>("createtime")
                        .HasColumnType("datetime2");

                    b.Property<bool>("isdisabled")
                        .HasColumnType("bit");

                    b.Property<string>("title")
                        .HasColumnType("nvarchar(20)");

                    b.HasKey("id");

                    b.ToTable("t_article");
                });

            modelBuilder.Entity("OneToMany.comment", b =>
                {
                    b.Property<long>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<Guid>("articleid")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("pubdate")
                        .HasColumnType("datetime2");

                    b.Property<string>("user_comments")
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("userid")
                        .HasColumnType("varchar(20)");

                    b.HasKey("id");

                    b.HasIndex("articleid");

                    b.ToTable("t_comment");
                });

            modelBuilder.Entity("OneToMany.comment", b =>
                {
                    b.HasOne("OneToMany.article", null)
                        .WithMany("_comment")
                        .HasForeignKey("articleid")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("OneToMany.article", b =>
                {
                    b.Navigation("_comment");
                });
#pragma warning restore 612, 618
        }
    }
}
