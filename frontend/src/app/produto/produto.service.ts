import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

/**
 * Espelha a entidade Produto do backend. O `id` e opcional porque um produto
 * ainda nao salvo nao tem id - quem gera e o Postgres (IDENTITY).
 */
export interface Produto {
  id?: number;
  nome: string;
  preco: number;
}

/**
 * Concentra as chamadas HTTP. E o equivalente ao seu DAO/service do JSF,
 * so que conversando por REST em vez de JDBC.
 *
 * A URL e RELATIVA ('/api/produtos'): e isso que faz a requisicao passar
 * pelo proxy.conf.json. Com URL absoluta (http://localhost:8080/...) o
 * navegador vai direto no backend e o proxy deixa de existir.
 */
@Injectable({ providedIn: 'root' })
export class ProdutoService {

  private http = inject(HttpClient);
  private url = '/api/produtos';

  listar() {
    return this.http.get<Produto[]>(this.url);
  }

  criar(produto: Produto) {
    return this.http.post<Produto>(this.url, produto);
  }

  atualizar(id: number, produto: Produto) {
    return this.http.put<Produto>(`${this.url}/${id}`, produto);
  }

  // O backend devolve 204 No Content, entao nao ha corpo para tipar.
  excluir(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
