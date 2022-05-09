using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "t_article",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    title = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    createtime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createby = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    isdisabled = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_article", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "t_comment",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_comments = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    pubdate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    userid = table.Column<string>(type: "varchar(20)", nullable: true),
                    articleid = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_comment", x => x.id);
                    table.ForeignKey(
                        name: "FK_t_comment_t_article_articleid",
                        column: x => x.articleid,
                        principalTable: "t_article",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_t_comment_articleid",
                table: "t_comment",
                column: "articleid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "t_comment");

            migrationBuilder.DropTable(
                name: "t_article");
        }
    }
}
