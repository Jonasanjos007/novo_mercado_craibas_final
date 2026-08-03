using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CamposCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Product_Category",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Banners",
                table: "Product_Category",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Product_Category",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Product_Category",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Meta_Description",
                table: "Product_Category",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Meta_Title",
                table: "Product_Category",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Banners",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Meta_Description",
                table: "Product_Category");

            migrationBuilder.DropColumn(
                name: "Meta_Title",
                table: "Product_Category");
        }
    }
}
