using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdVarienremovOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Variante_Products_Variante_ProductId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Variante_ProductId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Id_Variante_Product",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Variante_ProductId",
                table: "Orders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Variante_Product",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Variante_ProductId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Variante_ProductId",
                table: "Orders",
                column: "Variante_ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Variante_Products_Variante_ProductId",
                table: "Orders",
                column: "Variante_ProductId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }
    }
}
