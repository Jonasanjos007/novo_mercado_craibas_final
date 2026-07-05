using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdVarienteOderss2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Variante_Product",
                table: "OrderLineItens",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Variante_ProductId",
                table: "OrderLineItens",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLineItens_Variante_ProductId",
                table: "OrderLineItens",
                column: "Variante_ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductId",
                table: "OrderLineItens",
                column: "Variante_ProductId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLineItens_Variante_Products_Variante_ProductId",
                table: "OrderLineItens");

            migrationBuilder.DropIndex(
                name: "IX_OrderLineItens_Variante_ProductId",
                table: "OrderLineItens");

            migrationBuilder.DropColumn(
                name: "Id_Variante_Product",
                table: "OrderLineItens");

            migrationBuilder.DropColumn(
                name: "Variante_ProductId",
                table: "OrderLineItens");
        }
    }
}
