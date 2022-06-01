const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória" });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: "Você precisa confirmar sua senha" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({ message: "As senhas precisam ser iguais" });
      return;
    }
    //check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "Ops! Este email já está cadastrado",
      });
      return;
    }

    //create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });
    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ message: "O email é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória" });
    }

    //check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).json({
        message: "Ops! Não existe usuário cadastrado com este email",
      });
    }

    //check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({
        message:
          "Credenciais inválidas! Verifique se seus dados estão corretos.",
      });
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;
    //console.log(req.headers.authorization);
    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "tokensecret");
      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }
};
