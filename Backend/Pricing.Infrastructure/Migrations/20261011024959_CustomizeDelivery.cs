using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CustomizeDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customize_Delivery",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Global_Site_Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Dark = table.Column<bool>(type: "bit", nullable: false),
                    Id_User_Delivery = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customize_Delivery", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customize_Delivery_User_Delivery_Id_User_Delivery",
                        column: x => x.Id_User_Delivery,
                        principalTable: "User_Delivery",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customize_Delivery_Id_User_Delivery",
                table: "Customize_Delivery",
                column: "Id_User_Delivery",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Customize_Delivery");
        }
    }
}
