using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class id_varianteCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id_Variante",
                table: "Cart_Item",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Variante_ProductsId",
                table: "Cart_Item",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Item_Variante_ProductsId",
                table: "Cart_Item",
                column: "Variante_ProductsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Item_Variante_Products_Variante_ProductsId",
                table: "Cart_Item",
                column: "Variante_ProductsId",
                principalTable: "Variante_Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Item_Variante_Products_Variante_ProductsId",
                table: "Cart_Item");

            migrationBuilder.DropIndex(
                name: "IX_Cart_Item_Variante_ProductsId",
                table: "Cart_Item");

            migrationBuilder.DropColumn(
                name: "Id_Variante",
                table: "Cart_Item");

            migrationBuilder.DropColumn(
                name: "Variante_ProductsId",
                table: "Cart_Item");
        }
    }
}
