using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewcamposRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Order",
                table: "Rating",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Media",
                table: "Rating",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "Rating",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Recommend",
                table: "Rating",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Rating_OrderId",
                table: "Rating",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rating_Orders_OrderId",
                table: "Rating",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rating_Orders_OrderId",
                table: "Rating");

            migrationBuilder.DropIndex(
                name: "IX_Rating_OrderId",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Id_Order",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Media",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Recommend",
                table: "Rating");
        }
    }
}
