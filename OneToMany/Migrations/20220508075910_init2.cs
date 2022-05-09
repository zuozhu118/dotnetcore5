using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "pubdate",
                table: "t_comment",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "articleid1",
                table: "t_comment",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_t_comment_articleid1",
                table: "t_comment",
                column: "articleid1");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article_articleid1",
                table: "t_comment",
                column: "articleid1",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article_articleid1",
                table: "t_comment");

            migrationBuilder.DropIndex(
                name: "IX_t_comment_articleid1",
                table: "t_comment");

            migrationBuilder.DropColumn(
                name: "articleid1",
                table: "t_comment");

            migrationBuilder.AlterColumn<string>(
                name: "pubdate",
                table: "t_comment",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }
    }
}
