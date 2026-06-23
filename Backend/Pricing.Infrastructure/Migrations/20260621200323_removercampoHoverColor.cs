using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class removercampoHoverColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Global_Site_Color_Hover",
                table: "Customize_Cliente");

            migrationBuilder.DropColumn(
                name: "Global_Site_Color_Text",
                table: "Customize_Cliente");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Global_Site_Color_Hover",
                table: "Customize_Cliente",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Global_Site_Color_Text",
                table: "Customize_Cliente",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
