package com.trabalho.crud.controller;

import tools.jackson.databind.ObjectMapper;
import com.trabalho.crud.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercita a API inteira contra o H2 em memoria - sem Postgres e sem senha.
 *
 * O MockMvc sobe o Spring MVC de verdade (mapeamentos, validacao, Jackson)
 * e dispara requisicoes HTTP falsas, sem abrir porta de rede.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProdutoRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void limparBanco() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("POST cria o produto e devolve o id gerado")
    void deveCriar() throws Exception {
        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Teclado\",\"preco\":1349.90}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("Teclado"));
    }

    @Test
    @DisplayName("POST com nome vazio devolve 400 e nao grava")
    void deveRejeitarNomeVazio() throws Exception {
        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"  \",\"preco\":10.00}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST com preco negativo devolve 400")
    void deveRejeitarPrecoNegativo() throws Exception {
        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Mouse\",\"preco\":-5.00}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET lista os produtos cadastrados")
    void deveListar() throws Exception {
        criarProduto("Monitor", "899.00");

        mockMvc.perform(get("/api/produtos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Monitor"));
    }

    @Test
    @DisplayName("PUT altera os dados do produto")
    void deveAtualizar() throws Exception {
        Long id = criarProduto("Mouse", "50.00");

        mockMvc.perform(put("/api/produtos/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Mouse sem fio\",\"preco\":89.90}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Mouse sem fio"));
    }

    @Test
    @DisplayName("DELETE remove o produto e o GET seguinte devolve 404")
    void deveExcluir() throws Exception {
        Long id = criarProduto("Headset", "199.00");

        mockMvc.perform(delete("/api/produtos/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/produtos/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Operacoes em id inexistente devolvem 404")
    void deveDevolver404() throws Exception {
        mockMvc.perform(get("/api/produtos/9999")).andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/produtos/9999")).andExpect(status().isNotFound());
    }

    private Long criarProduto(String nome, String preco) throws Exception {
        String corpo = mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"" + nome + "\",\"preco\":" + preco + "}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(corpo).get("id").asLong();
    }
}
