using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init13 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment");

            migrationBuilder.AlterColumn<Guid>(
                name: "articleid",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment",
                column: "articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment");

            migrationBuilder.AlterColumn<Guid>(
                name: "articleid",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment",
                column: "articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
