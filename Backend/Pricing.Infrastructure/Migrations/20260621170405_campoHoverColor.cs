using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class campoHoverColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Global_Site_Color_Hover",
                table: "Customize_Cliente",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Global_Site_Color_Hover",
                table: "Customize_Cliente");
        }
    }
}
