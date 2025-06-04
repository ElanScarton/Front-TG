export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Produto {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  thumbnail: string;
}

export interface Lance {
  id: number;
  valor: number;
  vencedor: boolean;
  observacao?: string;
  usuarioId: number;
  leilaoId: number;
  dataCriacao: string;
  usuario: Usuario;
}

export interface Leilao {
  dataCriacao: string;
  dataAtualizacao: string;
  id?: number;
  titulo: string;
  descricao: string;
  precoInicial: number;
  precoFinal?: number;
  dataInicio: string;
  dataTermino: string;
  dataEntrega: string;
  status?: number;
  produtoId: number;
  usuarioId?: number;
}
