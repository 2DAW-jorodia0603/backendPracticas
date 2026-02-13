import supabase from "../config/supabase.js";

// Middleware para verificar que el usuario es admin
async function verificarAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar rol
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (usuarioError || !usuarioData || usuarioData.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default function adminRoutes(app) {
  
  // ==================== OBTENER TODOS LOS USUARIOS ====================
  app.get("/admin/usuarios", verificarAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== OBTENER UN USUARIO ====================
  app.get("/admin/usuarios/:id", verificarAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return res.status(404).json({ error: "Usuario no encontrado" });

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== CREAR USUARIO (ADMIN) ====================
  app.post("/admin/usuarios", verificarAdmin, async (req, res) => {
    const { email, password, nombre, rol = "usuario" } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email o password inválido" });
    }

    try {
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const userId = authData.user.id;

      // Insertar en tabla usuarios
      const { error: dbError } = await supabase
        .from("usuarios")
        .insert([{ id: userId, nombre, rol }]);

      if (dbError) {
        return res.status(500).json({ error: dbError.message });
      }

      res.json({
        message: "Usuario creado correctamente",
        user: { id: userId, email, nombre, rol }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== ACTUALIZAR USUARIO ====================
  app.put("/admin/usuarios/:id", verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, rol, email, password } = req.body;

    try {
      // Actualizar en tabla usuarios
      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (rol) updateData.rol = rol;

      const { error: dbError } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", id);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      // Si se proporciona email o password, actualizar en auth
      if (email || password) {
        const authUpdate = {};
        if (email) authUpdate.email = email;
        if (password) authUpdate.password = password;

        const { error: authError } = await supabase.auth.admin.updateUserById(
          id,
          authUpdate
        );

        if (authError) {
          return res.status(400).json({ error: authError.message });
        }
      }

      res.json({ message: "Usuario actualizado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== ELIMINAR USUARIO ====================
  app.delete("/admin/usuarios/:id", verificarAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      // Eliminar de la tabla usuarios
      const { error: dbError } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      // Eliminar del auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== ESTADÍSTICAS DEL DASHBOARD ====================
  app.get("/admin/estadisticas", verificarAdmin, async (req, res) => {
    try {
      // Contar usuarios
      const { count: totalUsuarios, error: usuariosError } = await supabase
        .from("usuarios")
        .select("*", { count: 'exact', head: true });

      if (usuariosError) throw usuariosError;

      // Contar usuarios por rol
      const { data: roles, error: rolesError } = await supabase
        .from("usuarios")
        .select("rol");

      if (rolesError) throw rolesError;

      const usuariosNormales = roles.filter(r => r.rol === 'usuario').length;
      const admins = roles.filter(r => r.rol === 'admin').length;

      res.json({
        totalUsuarios,
        usuariosNormales,
        admins,
        totalRestaurantes: 0, // Implementar cuando tengas tabla de restaurantes
        busquedasHoy: 0 // Implementar cuando tengas tabla de logs
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== LOGS DE ACTIVIDAD ====================
  app.get("/admin/actividad", verificarAdmin, async (req, res) => {
    // Aquí implementarías la lógica para obtener logs de actividad
    // Por ahora devuelvo datos de ejemplo
    res.json([
      {
        id: 1,
        fecha: new Date(),
        usuario: "Usuario Demo",
        accion: "Login",
        detalles: "Inicio de sesión exitoso"
      }
    ]);
  });

  // ==================== CONFIGURACIÓN DEL SISTEMA ====================
  app.get("/admin/configuracion", verificarAdmin, async (req, res) => {
    // Aquí obtendrías la configuración desde la BD
    res.json({
      nombreSistema: "MenuSense",
      emailContacto: "desarrollo1@holainformatica.com",
      mantenimiento: false,
      verificacionEmail: true,
      tiempoSesion: 60,
      intentosMaxLogin: 5
    });
  });

  app.put("/admin/configuracion", verificarAdmin, async (req, res) => {
    // Aquí guardarías la configuración en la BD
    res.json({ message: "Configuración actualizada correctamente" });
  });
}