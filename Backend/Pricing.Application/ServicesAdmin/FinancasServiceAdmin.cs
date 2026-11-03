using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class FinancasServiceAdmin : IFinancasAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IDeletionRecordService _deletionRecord;

        private static readonly string[] MesesAbrev =
            { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

        private static readonly string[] CategoriasPadrao =
            { "Aluguel", "Fornecedor", "Marketing", "Salários", "Impostos", "Frete", "Embalagem", "Serviços", "Outros" };

        public FinancasServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _deletionRecord = deletionRecord;
        }

        public async Task<Result<FinancasResumoResponse>> GetResumoMensal(int ano, int mes)
        {
            if (mes < 1 || mes > 12)
            {
                return Result<FinancasResumoResponse>.Failure(Error.Validation("Mes", "Mês inválido."));
            }

            var inicio = new DateTime(ano, mes, 1);
            var fim = inicio.AddMonths(1);
            var inicioAnterior = inicio.AddMonths(-1);

            var atual = await CalcularRangeAsync(inicio, fim);
            var anterior = await CalcularRangeAsync(inicioAnterior, inicio);

            var gastos = await SomaDespesasAsync(inicio, fim);
            var gastosAnterior = await SomaDespesasAsync(inicioAnterior, inicio);

            var receitaProdutos = atual.ReceitaProdutos;
            var lucroBruto = receitaProdutos - atual.Custo;
            var lucroLiquido = lucroBruto - gastos;

            var receitaProdutosAnterior = anterior.ReceitaProdutos;
            var lucroLiquidoAnterior = (receitaProdutosAnterior - anterior.Custo) - gastosAnterior;

            var resposta = new FinancasResumoResponse
            {
                Ano = ano,
                Mes = mes,
                Receita_Produtos = Arredonda(atual.ReceitaProdutos),
                Receita_Frete = Arredonda(atual.ReceitaFrete),
                Receita_Total = Arredonda(receitaProdutos),
                Custo_Produtos = Arredonda(atual.Custo),
                Lucro_Bruto = Arredonda(lucroBruto),
                Gastos = Arredonda(gastos),
                Lucro_Liquido = Arredonda(lucroLiquido),
                Margem_Percentual = receitaProdutos > 0 ? Arredonda(lucroLiquido / receitaProdutos * 100) : 0,
                Desconto_Cupons = Arredonda(atual.DescontoCupons),
                Total_Pedidos = atual.TotalPedidos,
                Total_Itens = atual.TotalItens,
                Ticket_Medio = atual.TotalPedidos > 0 ? Arredonda(receitaProdutos / atual.TotalPedidos) : 0,
                Receita_Total_Anterior = Arredonda(receitaProdutosAnterior),
                Lucro_Liquido_Anterior = Arredonda(lucroLiquidoAnterior),
                Variacao_Receita_Percentual = receitaProdutosAnterior > 0 ? Arredonda((receitaProdutos - receitaProdutosAnterior) / receitaProdutosAnterior * 100) : (double?)null,
                Variacao_Lucro_Percentual = lucroLiquidoAnterior != 0 ? Arredonda((lucroLiquido - lucroLiquidoAnterior) / Math.Abs(lucroLiquidoAnterior) * 100) : (double?)null
            };

            return Result<FinancasResumoResponse>.Success(resposta);
        }

        public async Task<Result<List<FinancasMesResponse>>> GetSerieMensal(int ano)
        {
            var lista = new List<FinancasMesResponse>();

            for (var mes = 1; mes <= 12; mes++)
            {
                var inicio = new DateTime(ano, mes, 1);
                var fim = inicio.AddMonths(1);

                var totais = await CalcularRangeAsync(inicio, fim);
                var gastos = await SomaDespesasAsync(inicio, fim);

                var receitaProdutos = totais.ReceitaProdutos;
                var lucroLiquido = (receitaProdutos - totais.Custo) - gastos;

                lista.Add(new FinancasMesResponse
                {
                    Ano = ano,
                    Mes = mes,
                    Label = MesesAbrev[mes - 1],
                    Receita = Arredonda(receitaProdutos),
                    Lucro_Liquido = Arredonda(lucroLiquido),
                    Gastos = Arredonda(gastos)
                });
            }

            return Result<List<FinancasMesResponse>>.Success(lista);
        }

        public async Task<Result<List<TopProdutoLucroResponse>>> GetTopProdutosLucro(int ano, int mes)
        {
            if (mes < 1 || mes > 12)
            {
                return Result<List<TopProdutoLucroResponse>>.Failure(Error.Validation("Mes", "Mês inválido."));
            }

            var inicio = new DateTime(ano, mes, 1);
            var fim = inicio.AddMonths(1);

            var pedidos = await _unitOfWorkAdmin.Query<Orders>().AsNoTracking()
                .Where(o => o.Isdelete != true && o.Stock_Deducted_At != null && o.Stock_Deducted_At >= inicio && o.Stock_Deducted_At < fim)
                .Select(o => new { o.Id, o.Discont, o.Discont_Percentage })
                .ToListAsync();

            if (pedidos.Count == 0)
            {
                return Result<List<TopProdutoLucroResponse>>.Success(new List<TopProdutoLucroResponse>());
            }

            var ids = pedidos.Select(p => p.Id).ToList();
            var itens = await _unitOfWorkAdmin.Query<OrderLineItens>().AsNoTracking()
                .Where(i => ids.Contains(i.Id_Order) && i.Isdelete != true)
                .Select(i => new { i.Id_Order, i.Id_Product, i.Name_Product, i.Quantity, i.Price_Unit, i.Custo_Unitario })
                .ToListAsync();

            var custosAtuais = await CustosAtuaisAsync(itens.Where(i => i.Custo_Unitario == null).Select(i => i.Id_Product));

            var acumulado = new Dictionary<int, TopProdutoLucroResponse>();
            var porPedido = itens.GroupBy(i => i.Id_Order).ToDictionary(g => g.Key, g => g.ToList());

            foreach (var ped in pedidos)
            {
                if (!porPedido.TryGetValue(ped.Id, out var linhas)) continue;

                var bruto = linhas.Sum(l => l.Price_Unit * l.Quantity);
                var desconto = ped.Discont > 0 ? ped.Discont : (ped.Discont_Percentage > 0 ? bruto * ped.Discont_Percentage / 100.0 : 0);
                if (desconto > bruto) desconto = bruto;

                foreach (var l in linhas)
                {
                    var linhaBruto = l.Price_Unit * l.Quantity;
                    var linhaDesconto = bruto > 0 ? desconto * (linhaBruto / bruto) : 0;
                    var linhaReceita = linhaBruto - linhaDesconto;
                    var custoUn = l.Custo_Unitario ?? (custosAtuais.TryGetValue(l.Id_Product, out var c) ? c : null) ?? 0;
                    var linhaCusto = custoUn * l.Quantity;

                    if (!acumulado.TryGetValue(l.Id_Product, out var item))
                    {
                        item = new TopProdutoLucroResponse { Id_Product = l.Id_Product, Nome = l.Name_Product };
                        acumulado[l.Id_Product] = item;
                    }

                    item.Quantidade_Vendida += l.Quantity;
                    item.Receita += linhaReceita;
                    item.Custo += linhaCusto;
                }
            }

            var resultado = acumulado.Values
                .Select(x =>
                {
                    x.Lucro = x.Receita - x.Custo;
                    x.Margem_Percentual = x.Receita > 0 ? Arredonda(x.Lucro / x.Receita * 100) : 0;
                    x.Receita = Arredonda(x.Receita);
                    x.Custo = Arredonda(x.Custo);
                    x.Lucro = Arredonda(x.Lucro);
                    return x;
                })
                .OrderByDescending(x => x.Lucro)
                .Take(10)
                .ToList();

            return Result<List<TopProdutoLucroResponse>>.Success(resultado);
        }

        public async Task<Result<List<DespesaResponse>>> GetListAllDespesas(int ano, int mes)
        {
            if (mes < 1 || mes > 12)
            {
                return Result<List<DespesaResponse>>.Failure(Error.Validation("Mes", "Mês inválido."));
            }

            var inicio = new DateTime(ano, mes, 1);
            var fim = inicio.AddMonths(1);

            var despesas = await _unitOfWorkAdmin.Query<Despesa>().AsNoTracking()
                .Where(d => d.Isdelete != true && d.Data >= inicio && d.Data < fim)
                .OrderByDescending(d => d.Data)
                .ThenByDescending(d => d.Id)
                .ToListAsync();

            var adminIds = despesas.Where(d => d.Id_User_Admin != null).Select(d => d.Id_User_Admin!.Value).Distinct().ToList();
            var nomes = adminIds.Count == 0
                ? new Dictionary<int, string>()
                : await _unitOfWorkAdmin.Query<User_Admin>().AsNoTracking()
                    .Where(u => adminIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.Name })
                    .ToDictionaryAsync(u => u.Id, u => u.Name);

            var lista = despesas.Select(d => new DespesaResponse
            {
                Id = d.Id,
                Descricao = d.Descricao,
                Valor = d.Valor,
                Categoria = d.Categoria,
                Data = d.Data,
                Nome_Admin = d.Id_User_Admin != null && nomes.TryGetValue(d.Id_User_Admin.Value, out var nome) ? nome : null
            }).ToList();

            return Result<List<DespesaResponse>>.Success(lista);
        }

        public async Task<Result<List<string>>> GetCategoriasDespesa()
        {
            var usadas = await _unitOfWorkAdmin.Query<Despesa>().AsNoTracking()
                .Where(d => d.Isdelete != true && d.Categoria != null && d.Categoria != "")
                .Select(d => d.Categoria!)
                .Distinct()
                .ToListAsync();

            var lista = CategoriasPadrao.Concat(usadas).Distinct().OrderBy(x => x).ToList();
            return Result<List<string>>.Success(lista);
        }

        public async Task<Result<bool>> PostSaveDespesa(DespesaRequest request, int IdUser)
        {
            if (string.IsNullOrWhiteSpace(request.Descricao))
            {
                return Result<bool>.Failure(Error.Validation("Descricao", "Informe a descrição da despesa."));
            }
            if (request.Valor <= 0)
            {
                return Result<bool>.Failure(Error.Validation("Valor", "O valor deve ser maior que zero."));
            }

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Despesa
            {
                Descricao = request.Descricao.Trim(),
                Valor = request.Valor,
                Categoria = string.IsNullOrWhiteSpace(request.Categoria) ? null : request.Categoria.Trim(),
                Data = request.Data == default ? DateTime.Now : request.Data,
                Id_User_Admin = IdUser,
                InsertDate = DateTime.Now,
                Isdelete = false
            });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostUpdateDespesa(DespesaUpdateRequest request, int IdUser)
        {
            if (request.Id == 0)
            {
                return Result<bool>.Failure(Error.Validation("Id", "Nenhuma despesa selecionada."));
            }
            if (string.IsNullOrWhiteSpace(request.Descricao))
            {
                return Result<bool>.Failure(Error.Validation("Descricao", "Informe a descrição da despesa."));
            }
            if (request.Valor <= 0)
            {
                return Result<bool>.Failure(Error.Validation("Valor", "O valor deve ser maior que zero."));
            }

            var despesa = await _unitOfWorkAdmin.GetClassAsyncWhere<Despesa>(x => x.Id == request.Id && x.Isdelete != true);
            if (despesa == null)
            {
                return Result<bool>.Failure(Error.NotFound("Despesa", "Despesa não encontrada."));
            }

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Despesa>(
                filters: new Dictionary<string, object> { { "Id", despesa.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Descricao", request.Descricao.Trim() },
                    { "Valor", request.Valor },
                    { "Categoria", (object?)(string.IsNullOrWhiteSpace(request.Categoria) ? null : request.Categoria.Trim()) ?? DBNull.Value },
                    { "Data", request.Data == default ? despesa.Data : request.Data },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteDespesa(int IdDespesa, int IdUser, string? reason)
        {
            if (IdDespesa == 0)
            {
                return Result<bool>.Failure(Error.Validation("Id", "Nenhuma despesa selecionada."));
            }
            if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5)
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            var despesa = await _unitOfWorkAdmin.GetClassAsyncWhere<Despesa>(x => x.Id == IdDespesa && x.Isdelete != true);
            if (despesa == null)
            {
                return Result<bool>.Failure(Error.NotFound("Despesa", "Despesa não encontrada ou já excluída."));
            }

            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            await _deletionRecord.RegisterAsync(new DeletionRecordRequest
            {
                EntityType = EntityTypeDelete.Despesa,
                EntityId = despesa.Id,
                DisplayName = despesa.Descricao,
                DeletedByUserId = IdUser,
                DeletedByRole = "ADMIN",
                DeletedByUserName = admin?.Name ?? "Administrador",
                Reason = reason.Trim(),
                Entity = despesa
            });

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Despesa>(
                filters: new Dictionary<string, object> { { "Id", despesa.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Isdelete", true },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        private async Task<RangeTotais> CalcularRangeAsync(DateTime inicio, DateTime fim)
        {
            var pedidos = await _unitOfWorkAdmin.Query<Orders>().AsNoTracking()
                .Where(o => o.Isdelete != true && o.Stock_Deducted_At != null && o.Stock_Deducted_At >= inicio && o.Stock_Deducted_At < fim)
                .Select(o => new { o.Id, o.Discont, o.Discont_Percentage, o.ShippingCost })
                .ToListAsync();

            var totais = new RangeTotais();
            if (pedidos.Count == 0)
            {
                return totais;
            }

            totais.TotalPedidos = pedidos.Count;

            var ids = pedidos.Select(p => p.Id).ToList();
            var itens = await _unitOfWorkAdmin.Query<OrderLineItens>().AsNoTracking()
                .Where(i => ids.Contains(i.Id_Order) && i.Isdelete != true)
                .Select(i => new { i.Id_Order, i.Id_Product, i.Quantity, i.Price_Unit, i.Custo_Unitario })
                .ToListAsync();

            var custosAtuais = await CustosAtuaisAsync(itens.Where(i => i.Custo_Unitario == null).Select(i => i.Id_Product));
            var porPedido = itens.GroupBy(i => i.Id_Order).ToDictionary(g => g.Key, g => g.ToList());

            foreach (var ped in pedidos)
            {
                totais.ReceitaFrete += ped.ShippingCost ?? 0;
                if (!porPedido.TryGetValue(ped.Id, out var linhas)) continue;

                var bruto = linhas.Sum(l => l.Price_Unit * l.Quantity);
                var desconto = ped.Discont > 0 ? ped.Discont : (ped.Discont_Percentage > 0 ? bruto * ped.Discont_Percentage / 100.0 : 0);
                if (desconto > bruto) desconto = bruto;

                totais.ReceitaProdutos += bruto - desconto;
                totais.DescontoCupons += desconto;

                foreach (var l in linhas)
                {
                    var custoUn = l.Custo_Unitario ?? (custosAtuais.TryGetValue(l.Id_Product, out var c) ? c : null) ?? 0;
                    totais.Custo += custoUn * l.Quantity;
                    totais.TotalItens += l.Quantity;
                }
            }

            return totais;
        }

        private async Task<Dictionary<int, double?>> CustosAtuaisAsync(IEnumerable<int> produtoIds)
        {
            var ids = produtoIds.Distinct().ToList();
            if (ids.Count == 0)
            {
                return new Dictionary<int, double?>();
            }

            return await _unitOfWorkAdmin.Query<Product>().AsNoTracking()
                .Where(p => ids.Contains(p.Id))
                .Select(p => new { p.Id, p.Preco_Custo })
                .ToDictionaryAsync(p => p.Id, p => p.Preco_Custo);
        }

        private async Task<double> SomaDespesasAsync(DateTime inicio, DateTime fim)
        {
            return await _unitOfWorkAdmin.Query<Despesa>().AsNoTracking()
                .Where(d => d.Isdelete != true && d.Data >= inicio && d.Data < fim)
                .SumAsync(d => (double?)d.Valor) ?? 0;
        }

        private static double Arredonda(double valor) => Math.Round(valor, 2);

        private class RangeTotais
        {
            public double ReceitaProdutos { get; set; }
            public double ReceitaFrete { get; set; }
            public double Custo { get; set; }
            public double DescontoCupons { get; set; }
            public int TotalPedidos { get; set; }
            public int TotalItens { get; set; }
        }
    }
}
