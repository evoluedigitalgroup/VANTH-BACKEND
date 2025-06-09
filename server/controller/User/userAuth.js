import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import authentication from "../../services/authentication";
import crypto from "crypto";
import validator from "../../validator/User";
import lang from "../../helpers/locale/lang";
import User from "../../models/users";
import Company from "../../models/Company";
import UserInvitation from "../../models/userInvitation";
import _ from "lodash";
import config from "../../config";
import sendEmail from "../../services/nodemailer";
import TokenSchema from '../../models/tokens'

const router = express.Router();

const emailContent = linkToValidate => {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Vanth Docs System</h1>
    <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Por favor, verifique seu email!</h2>
    <p style="font-size: 16px;">Este email contém um link seguro da Vanth Docs System. Por favor, clique no botão abaixo para verificar seu email.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${linkToValidate}" style="display: inline-block; background-color: #0068FF; color: #ffffff; font-size: 18px; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verificar Email</a>
    </div>
    <p style="font-size: 16px;">Se você não solicitou esta verificação, pode ignorar este email.</p>
    <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
    </div>`;
};

router.post("/login", validator.userLoginValidator, async (req, res) => {
  const { email, password } = req.body;

  const userFound = await User.findOne({ email });

  if (!userFound) {
    return res.json({
      success: false,
      message: lang.EMAIL_ADDRESS_IS_INVALID_TRY_AGAIN.PR,
    });
  }

  if (!userFound.verified) {
    return res.json({
      success: false,
      message:
        "Email não verificado, por favor verifique sua caixa de entrada/spam.",
    });
  }

  const validPassword = await bcrypt.compare(password, userFound.password);

  if (!validPassword) {
    return res.json({
      success: false,
      message: lang.PASSWORD_IS_INVALID.PR,
    });
  }
  const browserId = uuidv4();

  await User.findByIdAndUpdate(userFound._id, {
    browserId,
  });

  const jwtUserObj = authentication.generateObjForJwt(userFound, browserId);

  const jwtTokens = await authentication.UserSignInJwt(jwtUserObj);

  let responseUserObj = authentication.getUserObjForResponse(userFound);

  const response = {
    ...responseUserObj._doc,
    jwtTokens,
  };

  res.json({
    success: true,
    data: response,
    message: lang.LOGIN_SUCCESSFUL.PR,
  });
});

router.post(
  "/change-password",
  authentication.UserAuthValidateMiddleware,
  validator.changePasswordValidator,
  async (req, res) => {
    const userObj = req.user;
    const { newPassword } = req.body;
    if (userObj) {
      const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

      const hashed_password = await bcrypt.hash(newPassword, password_salt);
      await User.findByIdAndUpdate(userObj.id, {
        password: hashed_password,
      });

      res.json({
        success: true,
        data: null,
        message: lang.PASSWORD_UPDATED_SUCCESSFULLY.PR,
      });
    } else {
      res.json({
        success: false,
        data: null,
        message: lang.FOR_YOUR_SAFETY_CONTACT_THE_INOVA_TEAM.PR,
      });
    }
  },
);

router.post("/sign-up", validator.signUpValidator, async (req, res) => {
  const { name, email, password, code, companyName, designation } = req.body;
  if (companyName) {
    const newCompany = {
      uuid: uuidv4(),
      companyName: companyName,
    };

    const companyNameData = await new Company(newCompany).save();

    const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

    const hashed_password = await bcrypt.hash(password, password_salt);

    const addObj = {
      uuid: uuidv4(),
      company: companyNameData.id,
      name,
      email,
      password: hashed_password,
      permissions: {
        insights: true,
        clients: true,
        newUser: true,
        document: true,
        permissions: true,
        contract: true,
        tutorial: false,
      },
      isMainUser: true,
    };

    const newAdmin = await new User(addObj).save();

    if (_.isEmpty(newAdmin)) {
      // set jwt token
      res.json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER.PR,
      });
    }

    const token = new TokenSchema({
      userId: newAdmin.id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    await token.save();

    const linkToValidate = `${config.frontendUrl}/email-confirmation/${token.token}`;

    await sendEmail(
      email,
      "Vanth Docs - Validação de E-mail.",
      emailContent(linkToValidate),
    );

    res.json({
      success: true,
      data: newAdmin,
      message: lang.REGISTERED_SUCCESSFULLY.PR,
    });
  } else {
    const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));

    const hashed_password = await bcrypt.hash(password, password_salt);

    const codeInvitation = await UserInvitation.findOne({ code });

    if (!codeInvitation) {
      res.json({
        success: false,
        message: lang.CODE_IS_INVALID.PR,
      });
    }

    const findInvite = await User.findOne({ invitation: codeInvitation.id });

    if (findInvite != null) {
      res.json({
        success: false,
        message: lang.CODE_IS_ALREADY_USED.PR,
      });
    }

    const addObj = {
      uuid: uuidv4(),
      company: codeInvitation.company,
      name,
      email,
      password: hashed_password,
      code,
      designation,
      invitation: codeInvitation.id,
      permissions: codeInvitation.permissions,
    };
    const newAdmin = await new User(addObj).save();

    if (_.isEmpty(newAdmin)) {
      // set jwt token
      res.json({
        success: false,
        message: lang.SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER.PR,
      });
    }

    const token = new TokenSchema({
      userId: newAdmin.id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    await token.save();

    const linkToValidate = `${config.frontendUrl}/email-confirmation/${token.token}`;
    await sendEmail(
      addObj.email,
      "Vanth Docs - Validação de E-mail.",
      emailContent(linkToValidate),
    );

    res.json({
      success: true,
      data: newAdmin,
      message: lang.REGISTERED_SUCCESSFULLY.PR,
    });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const { token: bodyToken } = req.body;

    const token = await TokenSchema.findOne({ token: bodyToken });

    if (!token) {
      return res.json({ message: "O Token informado é inválido" });
    }

    await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
    await TokenSchema.findByIdAndRemove(token._id);

    return res.json({ message: "Email validado com sucesso" });
  } catch (e) {
    return res.json({ message: "Erro ao validar E-mail" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const message =
      "Link para redefinição de senha foi enviado para o seu email.";

    if (!user) {
      return res.json({
        success: true,
        message,
      });
    }

    const token = new TokenSchema({
      userId: user.id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    await token.save();
    const resetPasswordLink = `${config.frontendUrl}/reset-password/${token.token}`;
    const emailResetPassword = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0068FF; font-size: 28px; margin-bottom: 20px;">Sistema Vanth Docs</h1>
      <h2 style="color: #0068FF; font-size: 24px; margin-bottom: 20px;">Redefina Sua Senha</h2>
      <p style="font-size: 16px;">Você está recebendo este e-mail porque foi solicitada uma redefinição de senha para a sua conta.</p>
      <p style="font-size: 16px;">Se você não solicitou uma redefinição de senha, por favor, ignore este e-mail.</p>
      <p style="font-size: 16px;">Para redefinir sua senha, clique no botão abaixo:</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${resetPasswordLink}" style="display: inline-block; background-color: #0068FF; color: #ffffff; font-size: 18px; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Redefinir Senha</a>
      </div>
      <p style="font-size: 16px;">Se o botão acima não funcionar, você também pode copiar e colar o seguinte link em seu navegador:</p>
      <p style="font-size: 16px;">${resetPasswordLink}</p>
      <p style="font-size: 16px;">Este link expirará em 24 horas por motivos de segurança.</p>
      <p style="font-size: 16px;">Atenciosamente,<br/>Equipe Vanth Docs</p>
    </div>`;

    await sendEmail(user.email, "Vanth Docs - Redefinição de Senha", emailResetPassword);

    return res.json({
      success: true,
      message,
    });
  } catch (e) {
    console.log(e)
    return res.json({
      message: "Não foi possível gerar um link para redefinir a senha",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token: bodyToken, password: newPassword } = req.body;

    const token = await TokenSchema.findOne({ token: bodyToken });

    if (!token) {
      return res.json({ message: "O Token informado é inválido" });
    }

    const password_salt = bcrypt.genSaltSync(parseInt(config.passwordSalt));
    const hashed_password = await bcrypt.hash(newPassword, password_salt);

    await User.updateOne(
      { _id: token.userId },
      { $set: { password: hashed_password } },
    );
    await TokenSchema.findByIdAndRemove(token._id);

    return res.json({
      message: "A senha do usuário foi alterado com sucesso",
      success: true,
    });
  } catch (e) {
    return res.json({
      message: "Falha ao alterar a senha do usuário",
      success: false,
    });
  }
});


router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const newToken = await authentication.revalidateToken(refreshToken);
    res.json({
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});


export default router;