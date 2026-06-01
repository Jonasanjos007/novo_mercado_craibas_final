using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateMercado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cupom",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name_Cupom = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Cod_Cupom = table.Column<int>(type: "int", nullable: false),
                    Descriotion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Discont = table.Column<double>(type: "float", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    Minimum_Value = table.Column<double>(type: "float", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cupom", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Product_Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_Category", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User_Admin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Phone = table.Column<double>(type: "float", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User_Admin", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User_Customer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Phone = table.Column<double>(type: "float", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User_Customer", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User_Delivery",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CommissionDelivers = table.Column<double>(type: "float", nullable: true),
                    Transport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<double>(type: "float", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User_Delivery", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Price_Unit = table.Column<double>(type: "float", nullable: false),
                    Origin_Price = table.Column<double>(type: "float", nullable: false),
                    Id_Category = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                    ReviewCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CountSold = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Total_Stock = table.Column<int>(type: "int", nullable: false),
                    Badge = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FreeShipping = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    installments = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Featured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Cod_Cupom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Product_Product_Category_Id_Category",
                        column: x => x.Id_Category,
                        principalTable: "Product_Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Customize_Admin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Global_Site_Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Dark = table.Column<bool>(type: "bit", nullable: false),
                    Id_User_Admin = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customize_Admin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customize_Admin_User_Admin_Id_User_Admin",
                        column: x => x.Id_User_Admin,
                        principalTable: "User_Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cart_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Customize_Cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Global_Site_Color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Dark = table.Column<bool>(type: "bit", nullable: false),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customize_Cliente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customize_Cliente_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Road = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: true),
                    Id_User_Delivery = table.Column<int>(type: "int", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Address_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Address_User_Delivery_Id_User_Delivery",
                        column: x => x.Id_User_Delivery,
                        principalTable: "User_Delivery",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Imagens_Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    Url_Imagem = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Imagens_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Imagens_Products_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rating",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: false),
                    Ranting = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rating", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rating_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Rating_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Variante_Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Stoke = table.Column<int>(type: "int", nullable: false),
                    Price_Modifier = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variante_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Variante_Products_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cart_Item",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Cart = table.Column<int>(type: "int", nullable: false),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart_Item", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cart_Item_Cart_Id_Cart",
                        column: x => x.Id_Cart,
                        principalTable: "Cart",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cart_Item_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Number_Order = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Total_Value_Order = table.Column<double>(type: "float", nullable: false),
                    Discont = table.Column<double>(type: "float", nullable: false),
                    Discont_Percentage = table.Column<double>(type: "float", nullable: false),
                    Id_Cupom = table.Column<int>(type: "int", nullable: true),
                    Payment_terms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: true),
                    Order_Status = table.Column<int>(type: "int", nullable: false),
                    Id_Address = table.Column<int>(type: "int", nullable: false),
                    Id_User_Delivery = table.Column<int>(type: "int", nullable: false),
                    Delivery_Commission = table.Column<double>(type: "float", nullable: true),
                    Estimated_Delivery_Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Address_Id_Address",
                        column: x => x.Id_Address,
                        principalTable: "Address",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Cupom_Id_Cupom",
                        column: x => x.Id_Cupom,
                        principalTable: "Cupom",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_User_Customer_Id_User_Customer",
                        column: x => x.Id_User_Customer,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Orders_User_Delivery_Id_User_Delivery",
                        column: x => x.Id_User_Delivery,
                        principalTable: "User_Delivery",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderLineItens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Order = table.Column<int>(type: "int", nullable: false),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    Name_Product = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Variante_Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Variante_Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Variante_Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Total_Price = table.Column<double>(type: "float", nullable: false),
                    Origin_Price = table.Column<double>(type: "float", nullable: false),
                    Price_Unit = table.Column<double>(type: "float", nullable: false),
                    Discont = table.Column<double>(type: "float", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderLineItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderLineItens_Orders_Id_Order",
                        column: x => x.Id_Order,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderLineItens_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Address_Id_User_Customer",
                table: "Address",
                column: "Id_User_Customer",
                unique: true,
                filter: "[Id_User_Customer] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Address_Id_User_Delivery",
                table: "Address",
                column: "Id_User_Delivery",
                unique: true,
                filter: "[Id_User_Delivery] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Id_User_Customer",
                table: "Cart",
                column: "Id_User_Customer");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Item_Id_Cart",
                table: "Cart_Item",
                column: "Id_Cart");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Item_Id_Product",
                table: "Cart_Item",
                column: "Id_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Customize_Admin_Id_User_Admin",
                table: "Customize_Admin",
                column: "Id_User_Admin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customize_Cliente_Id_User_Customer",
                table: "Customize_Cliente",
                column: "Id_User_Customer",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Imagens_Products_Id_Product",
                table: "Imagens_Products",
                column: "Id_Product");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLineItens_Id_Order",
                table: "OrderLineItens",
                column: "Id_Order");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLineItens_Id_Product",
                table: "OrderLineItens",
                column: "Id_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_Address",
                table: "Orders",
                column: "Id_Address");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_Cupom",
                table: "Orders",
                column: "Id_Cupom");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_User_Customer",
                table: "Orders",
                column: "Id_User_Customer");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_User_Delivery",
                table: "Orders",
                column: "Id_User_Delivery");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Id_Category",
                table: "Product",
                column: "Id_Category");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_Id_Product",
                table: "Rating",
                column: "Id_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_Id_User_Customer",
                table: "Rating",
                column: "Id_User_Customer");

            migrationBuilder.CreateIndex(
                name: "IX_Variante_Products_Id_Product",
                table: "Variante_Products",
                column: "Id_Product");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cart_Item");

            migrationBuilder.DropTable(
                name: "Customize_Admin");

            migrationBuilder.DropTable(
                name: "Customize_Cliente");

            migrationBuilder.DropTable(
                name: "Imagens_Products");

            migrationBuilder.DropTable(
                name: "OrderLineItens");

            migrationBuilder.DropTable(
                name: "Rating");

            migrationBuilder.DropTable(
                name: "Variante_Products");

            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "User_Admin");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropTable(
                name: "Cupom");

            migrationBuilder.DropTable(
                name: "Product_Category");

            migrationBuilder.DropTable(
                name: "User_Customer");

            migrationBuilder.DropTable(
                name: "User_Delivery");
        }
    }
}
