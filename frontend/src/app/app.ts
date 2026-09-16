import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { Produto, ProdutoService } from './produto/produto.service';

/**
 * Componente unico com o CRUD completo.
 *
 * Angular 22 e "zoneless": nao existe mais o zone.js observando a pagina.
 * A tela so redesenha quando um SIGNAL muda - por isso TODO estado aqui e
 * signal() e a atualizacao e sempre .set().
 *
 * Comparando com o JSF: o signal faz o papel do atributo do @ViewScoped bean,
 * e o .set() faz o papel do ajax render="..." - so que automatico.
 */
@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    // Em componente standalone nao existe CommonModule implicito:
    // cada pipe usado no template precisa ser importado.
    CurrencyPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  // MessageService e ConfirmationService sao os "backing beans" do <p-toast>
  // e do <p-confirmdialog>. Sem declarar aqui, da NG0201 ao injetar.
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  private service = inject(ProdutoService);
  private mensagens = inject(MessageService);
  private confirmacao = inject(ConfirmationService);

  produtos = signal<Produto[]>([]);
  carregando = signal(false);

  dialogVisivel = signal(false);
  editandoId = signal<number | null>(null);
  nome = signal('');
  preco = signal<number | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);

    this.service.listar().subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro('Nao foi possivel carregar. O backend esta rodando na porta 8080?');
      },
    });
  }

  novo(): void {
    this.editandoId.set(null);
    this.nome.set('');
    this.preco.set(null);
    this.dialogVisivel.set(true);
  }

  editar(produto: Produto): void {
    this.editandoId.set(produto.id!);
    this.nome.set(produto.nome);
    this.preco.set(produto.preco);
    this.dialogVisivel.set(true);
  }

  salvar(): void {
    const dados: Produto = { nome: this.nome().trim(), preco: this.preco()! };
    const id = this.editandoId();

    // Mesmo formulario serve para criar e editar: quem decide o verbo HTTP
    // e a existencia do id.
    const requisicao = id
      ? this.service.atualizar(id, dados)
      : this.service.criar(dados);

    requisicao.subscribe({
      next: () => {
        this.dialogVisivel.set(false);
        this.sucesso(id ? 'Produto atualizado.' : 'Produto cadastrado.');
        this.carregar();
      },
      error: () => this.erro('Nao foi possivel salvar o produto.'),
    });
  }

  confirmarExclusao(produto: Produto): void {
    this.confirmacao.confirm({
      message: `Excluir o produto "${produto.nome}"?`,
      header: 'Confirmacao',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Nao',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluir(produto),
    });
  }

  private excluir(produto: Produto): void {
    this.service.excluir(produto.id!).subscribe({
      next: () => {
        this.sucesso('Produto excluido.');
        this.carregar();
      },
      error: () => this.erro('Nao foi possivel excluir o produto.'),
    });
  }

  private sucesso(detail: string): void {
    this.mensagens.add({ severity: 'success', summary: 'Sucesso', detail });
  }

  private erro(detail: string): void {
    this.mensagens.add({ severity: 'error', summary: 'Erro', detail });
  }
}
