using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init16 : Migration
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

            migrationBuilder.AddColumn<Guid>(
                name: "_articleid",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_t_comment__articleid",
                table: "t_comment",
                column: "_articleid");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article__articleid",
                table: "t_comment",
                column: "_articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article__articleid",
                table: "t_comment");

            migrationBuilder.DropIndex(
                name: "IX_t_comment__articleid",
                table: "t_comment");

            migrationBuilder.DropColumn(
                name: "_articleid",
                table: "t_comment");

            migrationBuilder.AddColumn<Guid>(
                name: "articleid",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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
                onDelete: ReferentialAction.Cascade);
        }
    }
}
