using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class listandreesId_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Address_Id_User_Customer",
                table: "Address");

            migrationBuilder.CreateIndex(
                name: "IX_Address_Id_User_Customer",
                table: "Address",
                column: "Id_User_Customer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Address_Id_User_Customer",
                table: "Address");

            migrationBuilder.CreateIndex(
                name: "IX_Address_Id_User_Customer",
                table: "Address",
                column: "Id_User_Customer",
                unique: true,
                filter: "[Id_User_Customer] IS NOT NULL");
        }
    }
}
