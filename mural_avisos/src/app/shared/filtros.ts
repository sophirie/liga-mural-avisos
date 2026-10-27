import { AutorAviso, AvisoFirebase } from '../services/aviso.service';

export type FiltroAutor = 'todos' | AutorAviso;

export const FILTROS_AUTOR: { valor: FiltroAutor; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'direcao', rotulo: 'Direção' },
  { valor: 'gremio', rotulo: 'Grêmio' },
  { valor: 'coordenacao', rotulo: 'Coordenação' },
  { valor: 'secretaria', rotulo: 'Secretaria' },
  { valor: 'professor', rotulo: 'Professor' },
];

export function filtrarPorAutor(avisos: AvisoFirebase[], filtro: FiltroAutor): AvisoFirebase[] {
  return filtro === 'todos' ? avisos : avisos.filter(a => a.autor === filtro);
}
