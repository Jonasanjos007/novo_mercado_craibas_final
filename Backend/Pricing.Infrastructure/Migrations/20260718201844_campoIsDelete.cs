using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class campoIsDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Variante_Products",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "User_Delivery",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "User_Customer",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "User_Admin",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Rating",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Product_Category",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Product",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Orders",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "OrderLineItens",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Logs",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Imagens_Products",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Customize_Cliente",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Customize_Admin",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Cupom",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Coupon_Use",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Coupon_Product",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Coupon_Category",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Cart_Item",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Cart",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Isdelete",
                table: "Address",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Variante_Products");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "User_Delivery");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "User_Customer");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "User_Admin");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "OrderLineItens");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Imagens_Products");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Customize_Cliente");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Customize_Admin");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Coupon_Use");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Coupon_Product");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Coupon_Category");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Cart_Item");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Cart");

            migrationBuilder.DropColumn(
                name: "Isdelete",
                table: "Address");
        }
    }
}
