const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');



module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ivan Kozak ${process.env.EMAIL_FROM}`;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }
    console.log('hello');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    return transporter;
  }


  async send(template, subject) {
    // 1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
      firstname: this.firstname,
      url: this.url,
      subject,
    })

    // 2) Define email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };


    // 3) Create a transport and send email
    const transporter = this.newTransporter();
    try{
      console.log(this);
      await transporter.sendMail(emailOptions);
    }catch (err){
      throw err;
    }
  }

  async sendWelcome(){
    await this.send('welcome', 'Welcome its natures!!!')
  }

  async sendPasswordReset(){
    await this.send('resetPassword', 'Your password reset token valid for only 10 min')
  }

};

// const sendEmail = async options => {    // options - emailTo, subjectLine, email content...
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
//
//   // 2) Define email options
//   const emailOptions = {
//     from: 'Ivan Kozak',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };
//
//
//   // 3) Send email
//   await transporter.sendMail(emailOptions);
// };

