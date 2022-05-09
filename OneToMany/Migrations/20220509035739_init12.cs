using Microsoft.EntityFrameworkCore.Migrations;

namespace OneToMany.Migrations
{
    public partial class init12 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article__articleid",
                table: "t_comment");

            migrationBuilder.RenameColumn(
                name: "_articleid",
                table: "t_comment",
                newName: "articleid");

            migrationBuilder.RenameIndex(
                name: "IX_t_comment__articleid",
                table: "t_comment",
                newName: "IX_t_comment_articleid");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment",
                column: "articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_t_comment_t_article_articleid",
                table: "t_comment");

            migrationBuilder.RenameColumn(
                name: "articleid",
                table: "t_comment",
                newName: "_articleid");

            migrationBuilder.RenameIndex(
                name: "IX_t_comment_articleid",
                table: "t_comment",
                newName: "IX_t_comment__articleid");

            migrationBuilder.AddForeignKey(
                name: "FK_t_comment_t_article__articleid",
                table: "t_comment",
                column: "_articleid",
                principalTable: "t_article",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
