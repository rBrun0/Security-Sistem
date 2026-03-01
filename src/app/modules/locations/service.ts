import { IBGECity, IBGEState } from "./types";

const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

async function fetchIBGE<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao consultar IBGE: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getStates(): Promise<IBGEState[]> {
  const states = await fetchIBGE<IBGEState[]>(`${IBGE_BASE_URL}/estados`);

  return states.sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function getCitiesByState(uf: string): Promise<IBGECity[]> {
  if (!uf) return [];

  const cities = await fetchIBGE<IBGECity[]>(
    `${IBGE_BASE_URL}/estados/${uf}/municipios`,
  );

  return cities.sort((a, b) => a.nome.localeCompare(b.nome));
}
