using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdVarienremovOrdersLineitensRemove : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductId",
                table: "OrderLineItens");

            migrationBuilder.RenameColumn(
                name: "Variante_ProductId",
                table: "OrderLineItens",
                newName: "Variante_ProductsId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderLineItens_Variante_ProductId",
                table: "OrderLineItens",
                newName: "IX_OrderLineItens_Variante_ProductsId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductsId",
                table: "OrderLineItens",
                column: "Variante_ProductsId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductsId",
                table: "OrderLineItens");

            migrationBuilder.RenameColumn(
                name: "Variante_ProductsId",
                table: "OrderLineItens",
                newName: "Variante_ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderLineItens_Variante_ProductsId",
                table: "OrderLineItens",
                newName: "IX_OrderLineItens_Variante_ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductId",
                table: "OrderLineItens",
                column: "Variante_ProductId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }
    }
}
