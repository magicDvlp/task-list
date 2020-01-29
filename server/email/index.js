const config = require('config');
const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = config.get('SENDGRID_API_KEY');
const EMAIL_FROM = config.get('EMAIL_FROM');
const CLIENT_URL = config.get('CLIENT_URL');
sgMail.setApiKey(SENDGRID_API_KEY);

function welcomeLetter(email){
    const config = {
        from: EMAIL_FROM,
        to: email,
        subject: 'Регистрация на task-list',
        html: `
            <h3>Спасибо за регистрацию на task-list!</h3>
        `
    };
    sgMail.send(config);
}

function resetPasswordLetter({email, token}){
    const config = {
        from: EMAIL_FROM,
        to: email,
        subject: 'Востановление пароля task-list',
        html: `
            <h3>Востановление пароля</h3>
            <p>Для востановления пароля, перейдите по ссылке:<a href="${CLIENT_URL}/resetPassword/${token}">востановить пароль</a></p>
        `
    };
    sgMail.send(config);
}

module.exports = {
    welcomeLetter,
    resetPasswordLetter
};