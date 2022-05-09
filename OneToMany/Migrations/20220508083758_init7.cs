using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init7 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
