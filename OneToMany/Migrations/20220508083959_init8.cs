using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init8 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment");

            migrationBuilder.DropIndex(
                name: "IX_t_comment_articleid",
                table: "t_comment");

            migrationBuilder.DropColumn(
                name: "articleid",
                table: "t_comment");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "articleid",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_t_comment_articleid",
                table: "t_comment",
                column: "articleid");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment",
                column: "articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
