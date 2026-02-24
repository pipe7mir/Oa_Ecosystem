import { supabase } from '../common/supabaseClient.js';

/* ==========================================================
   MODULO 1: REGISTRO Y CAPTURA DE DATOS
   ========================================================== */
export const registerUser = async (email, password, username, phone) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        username: username,
        phone_number: phone 
      }
    }
  });
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 2: ACCESO Y VALIDACIÓN (LOGIN)
   ========================================================== */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 3: GESTIÓN DE PERFIL Y ESTADO
   ========================================================== */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 4: CIERRE DE SESIÓN
   ========================================================== */
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = '/src/auth/login.html'; 
};

/* ==========================================================
   MODULO 5: ADMINISTRACIÓN DE USUARIOS (NUEVO)
   Funciones exclusivas para que el Admin gestione el sistema.
   ========================================================== */

/**
 * updateUserProfile: Permite cambiar el rol o el estado de aprobación.
 * @param {string} userId - ID del usuario a modificar.
 * @param {object} updates - Objeto con los campos a cambiar (ej: { role: 'admin' }).
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

/**
 * getAllProfiles: Obtiene la lista completa de usuarios para el panel de gestión.
 */
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};