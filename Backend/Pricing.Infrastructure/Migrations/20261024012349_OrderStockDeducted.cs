using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OrderStockDeducted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Stock_Deducted_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            // Pedidos que já estavam confirmados/em andamento antes desta versão contam como
            // "estoque já baixado": assim a regra nova vale só para pedidos novos e o estoque
            // atual não sofre baixa retroativa.
            migrationBuilder.Sql(
                "UPDATE Orders SET Stock_Deducted_At = GETDATE() " +
                "WHERE Order_Status IN ('CONFIRMADO','PREPARANDO','SAIU_PARA_ENTREGA','ENTREGUE');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stock_Deducted_At",
                table: "Orders");
        }
    }
}
