import { supabase } from './supabase';

export async function dbConnect() {
  try {
    // Run a fast query to test connection to Supabase
    const { error } = await supabase.from('SystemSettings').select('appName').limit(1);
    if (error) {
      throw error;
    }
    return true;
  } catch (e) {
    console.error('Supabase connection test failed:', e);
    throw e;
  }
}

export default dbConnect;
