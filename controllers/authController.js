const NinoModel = require("../models/ninoModel");
const InstructorModel = require("../models/instructorModel");

class AuthController {
  static showRegister(req, res) {
    res.sendFile("register.html", { root: "./views" });
  }

  static showLogin(req, res) {
    res.sendFile("login.html", { root: "./views" });
  }

  static async register(req, res) {
    try {
      const { nombre_nino, edad, nombre_instructor, cedula_instructor } = req.body;

      if (!nombre_nino || !edad || !nombre_instructor || !cedula_instructor) {
        return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
      }

      if (edad < 2 || edad > 4) {
        return res.status(400).json({ success: false, message: "La edad debe estar entre 2 y 4 años" });
      }

      let instructor = await InstructorModel.findByCedula(cedula_instructor);
      if (!instructor) {
        const newInstructorId = await InstructorModel.create({ nombre: nombre_instructor, cedula: cedula_instructor });
        instructor = { id: newInstructorId };
      }

      await NinoModel.create({
        nombre: nombre_nino,
        edad,
        instructor_id: instructor.id,
      });

      res.json({ success: true, message: "Perfil creado exitosamente" });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }

  static async login(req, res) {
    try {
      const { nino_id } = req.body;

      if (!nino_id) {
        return res.status(400).json({ success: false, message: "Debes seleccionar un niño" });
      }

      const nino = await NinoModel.findById(nino_id);
      if (!nino) {
        return res.status(404).json({ success: false, message: "Niño no encontrado" });
      }

      req.session.ninoId = nino.id;
      req.session.nombreNino = nino.nombre;
      req.session.edad = nino.edad;

      res.json({ success: true });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
      }
      res.json({ success: true, message: "Sesión cerrada correctamente" });
    });
  }

  static getCurrentUser(req, res) {
    if (!req.session.ninoId) {
      return res.status(401).json({ success: false, message: "No hay sesión activa" });
    }

    res.json({
      success: true,
      user: {
        id: req.session.ninoId,
        nombre: req.session.nombreNino,
        edad: req.session.edad,
      },
    });
  }
}

module.exports = AuthController;
