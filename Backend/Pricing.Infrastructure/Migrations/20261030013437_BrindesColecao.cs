using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BrindesColecao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brinde",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Imagem = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Estoque = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Quantidade_Compras = table.Column<int>(type: "int", nullable: true),
                    Colecao = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brinde", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Brinde_Cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Brinde = table.Column<int>(type: "int", nullable: false),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: false),
                    Id_Order = table.Column<int>(type: "int", nullable: true),
                    Origem = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Entregue_Em = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Quem_Entregou = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brinde_Cliente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Brinde_Cliente_Brinde_Id_Brinde",
                        column: x => x.Id_Brinde,
                        principalTable: "Brinde",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Brinde_Cliente_Orders_Id_Order",
                        column: x => x.Id_Order,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Brinde_Cliente_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Colecao",
                table: "Brinde",
                column: "Colecao");

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Quantidade_Compras",
                table: "Brinde",
                column: "Quantidade_Compras");

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Cliente_Id_Brinde",
                table: "Brinde_Cliente",
                column: "Id_Brinde");

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Cliente_Id_Order",
                table: "Brinde_Cliente",
                column: "Id_Order");

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Cliente_Id_User_Customer_Id_Brinde",
                table: "Brinde_Cliente",
                columns: new[] { "Id_User_Customer", "Id_Brinde" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brinde_Cliente_Status",
                table: "Brinde_Cliente",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Brinde_Cliente");

            migrationBuilder.DropTable(
                name: "Brinde");
        }
    }
}
