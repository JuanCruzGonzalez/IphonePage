import { supabase } from '../../../core/config/supabase';
import { PlanDePago, PlanDePagoInput } from '../../../core/types';

export async function getPlanesDePago(): Promise<PlanDePago[]> {
  const { data, error } = await supabase
    .rpc('consultar_planespago');
  if (error) throw error;
  // data contiene venta y cliente como objetos
  return data || [];
}

export async function getPlanByVenta(id_venta: number): Promise<PlanDePago | null> {
  const { data, error } = await supabase
    .from('plan_de_pago')
    .select('*')
    .eq('id_venta', id_venta)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPlanDePago(input: PlanDePagoInput): Promise<PlanDePago> {
  const { data, error } = await supabase
    .from('plan_de_pago')
    .insert({
      id_venta: input.id_venta,
      id_cliente: input.id_cliente ?? null,
      cliente_nombre: input.cliente_nombre,
      cliente_telefono: input.cliente_telefono,
      numero_cuotas: input.numero_cuotas,
      monto_total: input.monto_total,
      monto_cuota: input.monto_cuota,
      fecha_inicio: input.fecha_inicio ?? new Date().toISOString().split('T')[0],
      notas: input.notas ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Registra el pago de la siguiente cuota.
 *  Si se alcanzan todas las cuotas, el trigger de DB
 *  cambia el estado a 'completado' y marca la venta como pagada. */
export async function registrarPagoCuota(id_plan: number): Promise<PlanDePago> {
  const { data: current, error: fetchErr } = await supabase
    .from('plan_de_pago')
    .select('cuotas_pagadas')
    .eq('id_plan', id_plan)
    .single();

  if (fetchErr) throw fetchErr;

  const { data, error } = await supabase
    .from('plan_de_pago')
    .update({ cuotas_pagadas: current.cuotas_pagadas + 1 })
    .eq('id_plan', id_plan)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelarPlan(id_plan: number): Promise<void> {
  const { error } = await supabase
    .from('plan_de_pago')
    .update({ estado: 'cancelado' })
    .eq('id_plan', id_plan);

  if (error) throw error;
}
