using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdVarienremovOrdersLineitensRemove2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductsId",
                table: "OrderLineItens");

            migrationBuilder.DropIndex(
                name: "IX_OrderLineItens_Variante_ProductsId",
                table: "OrderLineItens");

            migrationBuilder.DropColumn(
                name: "Variante_ProductsId",
                table: "OrderLineItens");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Variante_ProductsId",
                table: "OrderLineItens",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLineItens_Variante_ProductsId",
                table: "OrderLineItens",
                column: "Variante_ProductsId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductsId",
                table: "OrderLineItens",
                column: "Variante_ProductsId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }
    }
}
